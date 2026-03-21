"""
scripts/index_schemes.py
Bulk index all 20 preloaded schemes into Pinecone.
Run once after setting up Pinecone and the backend.

Usage:
    cd backend
    python ../scripts/index_schemes.py
"""

import sys
import os
import logging

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "backend"))

from config import get_settings
from services.chunker import chunk_text
from services.embedder import embed_texts
from services.vectorstore import upsert_chunks, TextChunk

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

settings = get_settings()

# All 20 preloaded schemes — must match src/data/schemes.ts
SCHEMES = [
    {
        "id": "pm-awas-yojana",
        "name": "PM Awas Yojana (Urban)",
        "description": "Housing for All scheme providing financial assistance for construction or purchase of house.",
        "eligibility": "Annual income below Rs 18 lakh. Must not own a pucca house anywhere in India. EWS: income up to Rs 3 lakh. LIG: Rs 3-6 lakh. MIG-I: Rs 6-12 lakh. MIG-II: Rs 12-18 lakh.",
        "ministry": "Ministry of Housing and Urban Affairs",
        "documents": "Aadhaar card, income certificate, bank account details, property documents, caste certificate if applicable",
    },
    {
        "id": "pm-awas-yojana-gramin",
        "name": "PM Awas Yojana (Gramin)",
        "description": "Rural housing scheme providing financial assistance to homeless and kutcha house dwellers.",
        "eligibility": "Houseless families or those living in kutcha or dilapidated houses. SECC 2011 data used for identification. Priority to SC/ST, minorities, disabled.",
        "ministry": "Ministry of Rural Development",
        "documents": "Aadhaar card, bank account, job card if applicable, BPL certificate",
    },
    {
        "id": "ayushman-bharat",
        "name": "Ayushman Bharat PM-JAY",
        "description": "Health insurance scheme providing Rs 5 lakh coverage per family per year for secondary and tertiary care.",
        "eligibility": "Based on SECC 2011 database. Deprivation criteria for rural and occupational criteria for urban. No income limit but must be in SECC database.",
        "ministry": "Ministry of Health and Family Welfare",
        "documents": "Aadhaar card, ration card, SECC data verification, family composition proof",
    },
    {
        "id": "pm-kisan",
        "name": "PM Kisan Samman Nidhi",
        "description": "Income support of Rs 6000 per year to farmer families in three equal instalments.",
        "eligibility": "All landholding farmer families. Exclusions: income tax payers, constitutional post holders, government employees, professionals earning above Rs 10000/month.",
        "ministry": "Ministry of Agriculture",
        "documents": "Aadhaar card, land records, bank account, mobile number",
    },
    {
        "id": "pm-ujjwala",
        "name": "PM Ujjwala Yojana",
        "description": "Free LPG connections to women from below poverty line households.",
        "eligibility": "Women above 18 years from BPL households. No LPG connection in household name. SECC 2011 or BPL list identification.",
        "ministry": "Ministry of Petroleum and Natural Gas",
        "documents": "Aadhaar card, BPL ration card, bank account, address proof",
    },
    {
        "id": "sukanya-samriddhi",
        "name": "Sukanya Samriddhi Yojana",
        "description": "Small savings scheme for girl child with high interest rate and tax benefits.",
        "eligibility": "Girl child below 10 years of age. Account opened by parent or legal guardian. Maximum two accounts per family (three in case of twins).",
        "ministry": "Ministry of Finance",
        "documents": "Girl child birth certificate, parent Aadhaar card, address proof, photograph",
    },
    {
        "id": "pm-mudra",
        "name": "PM MUDRA Yojana",
        "description": "Loans up to Rs 10 lakh for non-farm micro and small enterprises.",
        "eligibility": "Non-farm income generating activities. Shishu: up to Rs 50000. Kishore: Rs 50000-5 lakh. Tarun: Rs 5-10 lakh. No collateral required for Shishu.",
        "ministry": "Ministry of Finance",
        "documents": "Identity proof, address proof, business proof, bank statement, photographs",
    },
    {
        "id": "atal-pension-yojana",
        "name": "Atal Pension Yojana",
        "description": "Pension scheme for unorganised sector workers with guaranteed monthly pension of Rs 1000-5000.",
        "eligibility": "Age 18-40 years. Must have savings bank account. Not an income tax payer. Not covered under statutory social security schemes.",
        "ministry": "Ministry of Finance",
        "documents": "Aadhaar card, bank account, mobile number",
    },
    {
        "id": "pm-jeevan-jyoti",
        "name": "PM Jeevan Jyoti Bima Yojana",
        "description": "Life insurance cover of Rs 2 lakh at premium of Rs 436 per year.",
        "eligibility": "Age 18-50 years. Must have bank account with auto-debit facility. Aadhaar mandatory.",
        "ministry": "Ministry of Finance",
        "documents": "Aadhaar card, bank account, consent form",
    },
    {
        "id": "pm-suraksha-bima",
        "name": "PM Suraksha Bima Yojana",
        "description": "Accidental death and disability insurance of Rs 2 lakh at premium of Rs 20 per year.",
        "eligibility": "Age 18-70 years. Must have bank account. Aadhaar mandatory as primary KYC.",
        "ministry": "Ministry of Finance",
        "documents": "Aadhaar card, bank account, consent form",
    },
    {
        "id": "national-scholarship",
        "name": "National Scholarship Portal Schemes",
        "description": "Scholarships for students from minority, SC, ST, OBC communities for pre and post matric studies.",
        "eligibility": "Varies by scheme. Generally: income below Rs 2-2.5 lakh per year, minimum marks criteria, community certificates required.",
        "ministry": "Ministry of Education / Minority Affairs",
        "documents": "Income certificate, caste/community certificate, marksheets, bank account, Aadhaar",
    },
    {
        "id": "pm-fasal-bima",
        "name": "PM Fasal Bima Yojana",
        "description": "Crop insurance scheme providing financial support to farmers suffering crop loss due to natural calamities.",
        "eligibility": "All farmers including sharecroppers and tenant farmers growing notified crops. Compulsory for loanee farmers.",
        "ministry": "Ministry of Agriculture",
        "documents": "Land records, bank account, Aadhaar card, sowing certificate",
    },
    {
        "id": "standup-india",
        "name": "Stand Up India",
        "description": "Bank loans between Rs 10 lakh and Rs 1 crore for SC/ST and women entrepreneurs.",
        "eligibility": "SC/ST or women borrowers. Above 18 years. First time enterprise in manufacturing, services or trading. Not in default to any bank.",
        "ministry": "Ministry of Finance",
        "documents": "Identity proof, address proof, business plan, caste certificate, bank statement",
    },
    {
        "id": "skill-india",
        "name": "Pradhan Mantri Kaushal Vikas Yojana",
        "description": "Free skill training and certification for youth with monetary rewards on successful completion.",
        "eligibility": "Indian nationals. School/college dropout or unemployed. Age varies by training program. No prior educational qualification needed for some courses.",
        "ministry": "Ministry of Skill Development",
        "documents": "Aadhaar card, educational certificates, bank account, photographs",
    },
    {
        "id": "jan-dhan",
        "name": "PM Jan Dhan Yojana",
        "description": "Zero balance bank account with RuPay debit card, overdraft facility up to Rs 10000 and insurance cover.",
        "eligibility": "Any Indian citizen above 10 years without a bank account. Zero minimum balance. Overdraft after 6 months of satisfactory operation.",
        "ministry": "Ministry of Finance",
        "documents": "Aadhaar card or any identity proof, address proof, photograph",
    },
    {
        "id": "swachh-bharat",
        "name": "Swachh Bharat Mission - Gramin",
        "description": "Individual household latrine construction support of Rs 12000 for rural BPL families.",
        "eligibility": "Rural households without toilet. BPL or SECC listed families get priority. SC/ST, small and marginal farmers, landless labourers eligible.",
        "ministry": "Ministry of Jal Shakti",
        "documents": "BPL card or SECC listing, Aadhaar card, bank account, land proof",
    },
    {
        "id": "e-shram",
        "name": "e-Shram Portal Registration",
        "description": "National database of unorganised workers providing access to social security benefits.",
        "eligibility": "Unorganised workers aged 16-59 years. Not a member of EPFO or ESIC. Not an income tax payer.",
        "ministry": "Ministry of Labour and Employment",
        "documents": "Aadhaar card, bank account linked to Aadhaar, mobile number",
    },
    {
        "id": "one-nation-one-ration",
        "name": "One Nation One Ration Card",
        "description": "Portability of ration card benefits across India for migrant workers and their families.",
        "eligibility": "Existing ration card holders under National Food Security Act. Aadhaar seeding with ration card mandatory.",
        "ministry": "Ministry of Food and Consumer Affairs",
        "documents": "Existing ration card, Aadhaar card, mobile number",
    },
    {
        "id": "pm-garib-kalyan",
        "name": "PM Garib Kalyan Anna Yojana",
        "description": "Free food grains of 5 kg per person per month to NFSA beneficiaries.",
        "eligibility": "All NFSA (National Food Security Act) beneficiaries. Priority households and Antyodaya Anna Yojana cardholders.",
        "ministry": "Ministry of Food and Consumer Affairs",
        "documents": "Ration card, Aadhaar card",
    },
    {
        "id": "digital-india",
        "name": "Digital India — CSC Services",
        "description": "Access to government services, digital payments, and e-governance through Common Service Centres.",
        "eligibility": "All Indian citizens. CSC operator: minimum 10th pass, age 18+, computer knowledge, suitable premises.",
        "ministry": "Ministry of Electronics and IT",
        "documents": "Aadhaar card, PAN card for financial services, relevant documents per service",
    },
]


def index_all_schemes():
    if not settings.pinecone_api_key:
        logger.error("PINECONE_API_KEY not set in .env")
        sys.exit(1)

    logger.info(f"Indexing {len(SCHEMES)} schemes to Pinecone index: {settings.pinecone_index_name}")

    total_chunks = 0
    for i, scheme in enumerate(SCHEMES):
        logger.info(f"[{i+1}/{len(SCHEMES)}] Processing: {scheme['name']}")

        # Build rich text content for this scheme
        content = f"""Scheme: {scheme['name']}
Ministry: {scheme['ministry']}

Description:
{scheme['description']}

Eligibility Criteria:
{scheme['eligibility']}

Required Documents:
{scheme['documents']}
"""

        # Chunk
        chunks = chunk_text(content, document_id=scheme["id"])
        if not chunks:
            logger.warning(f"No chunks for {scheme['id']}")
            continue

        # Embed
        texts = [c.text for c in chunks]
        embeddings = embed_texts(texts, model_name=settings.embedding_model)

        # Upsert to Pinecone
        upserted = upsert_chunks(
            document_id=scheme["id"],
            chunks=chunks,
            embeddings=embeddings,
            api_key=settings.pinecone_api_key,
            index_name=settings.pinecone_index_name,
        )

        total_chunks += upserted
        logger.info(f"  ✓ {upserted} vectors upserted")

    logger.info(f"\n✅ Done! Total vectors in Pinecone: {total_chunks}")


if __name__ == "__main__":
    index_all_schemes()
