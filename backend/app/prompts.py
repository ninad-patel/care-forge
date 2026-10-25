"""Prompt engineering templates and guidelines for CareForge.

Enforces section-budgeted prompt structures to reliably produce high-quality,
~1,000-word structured markdown articles tailored to brand and healthcare context.
Respects prompt-engineering-blogs standards.
"""

from app.constants import TARGET_WORD_COUNT

# Master prompt template enforcing 6-section structure and brand injection
BLOG_GENERATION_PROMPT_TEMPLATE = """You are an elite healthcare content strategist and editorial writer crafting an authoritative, engaging, and comprehensive ~{target_word_count}-word educational blog post on behalf of "{company_name}".

Topic: "{topic}"

### CRITICAL REQUIREMENTS:
1. Target Word Count: You MUST write a detailed, in-depth article approaching 900 to {target_word_count} words. Do NOT provide brief summaries.
2. Tone & Authority: Informative, empathetic, evidence-informed, and clear for both patients and healthcare professionals.
3. Brand Integration: Naturally reference "{company_name}" in the introduction as an industry pioneer and provide a tailored Call-to-Action on behalf of "{company_name}" in the conclusion.
4. Output Formatting: Output ONLY valid, clean Markdown.
   - Do NOT enclose the entire response in triple backticks (e.g., do NOT start with ```markdown or end with ```).
   - Start immediately with the top-level H1 title (# Title).
   - Use proper heading hierarchy (# H1, ## H2, ### H3), bold text, bullet points, and numbered lists where appropriate.

### MANDATORY SECTION-BY-SECTION STRUCTURE & WORD BUDGET:

# [Compelling, Patient-Centric H1 Title]

## Introduction (~150 words)
- Hook the reader with why "{topic}" is critical in modern health and wellness.
- Explain the real-world significance and introduce "{company_name}" as a trusted partner in advancing healthcare awareness.

## Understanding the Foundations of {topic} (~200 words)
- Provide a deep dive into core concepts, underlying physiological or systemic mechanisms, and clinical context.
- Use clear explanations that bridge technical clinical concepts and actionable patient understanding.

## Key Challenges and Preventative Strategies (~200 words)
- Detail common risks, complications, or diagnostic hurdles associated with {topic}.
- Include a bulleted breakdown of actionable, evidence-based preventive measures and daily lifestyle adjustments.

## Advanced Innovations and Clinical Breakthroughs (~200 words)
- Highlight recent clinical advancements, diagnostic technologies, or therapies transforming care for {topic}.
- Discuss how modern approaches improve patient outcomes, quality of life, and safety.

## Practical Takeaways & Frequently Asked Questions (~150 words)
- Present 2 to 3 concise, high-value FAQ pairs addressing common concerns patients or caregivers have regarding {topic}.
- Format with bold questions and practical, reassuring answers.

## Conclusion & Next Steps with {company_name} (~100 words)
- Summarize the central theme with an empowering takeaway.
- Conclude with a strong, tailored Call-to-Action inviting readers to connect with "{company_name}" for personalized healthcare guidance, educational resources, or consultation.
"""


def build_blog_prompt(topic: str, company_name: str) -> str:
    """Construct a section-budgeted prompt instructing the LLM to write ~1,000 words in Markdown.

    Args:
        topic: The specific blog subject/topic.
        company_name: The brand/company name to inject for tailored context.

    Returns:
        Structured prompt string with injected parameters.
    """
    return BLOG_GENERATION_PROMPT_TEMPLATE.format(
        topic=topic,
        company_name=company_name,
        target_word_count=f"{TARGET_WORD_COUNT:,}",
    )
