---
name: prompt-engineering-blogs
description: Prompt engineering guidelines to reliably produce high-quality, comprehensive ~1,000-word structured markdown blogs with brand and healthcare context.
---

# Prompt Engineering Standards for 1,000-Word Blogs

## Purpose
Standard LLM responses naturally stop around 400–500 words unless explicitly guided. This skill ensures the prompt reliably elicits comprehensive, multi-section, ~1,000-word structured markdown articles tailored to the user's company and brand voice.

## Key Rules

### 1. Structural Sectioning (Enforcing Length to Reach ~1,000 Words)
Instruct the model with explicit word budgets per section:
- **Title (H1)**: Clear, compelling headline.
- **Introduction (~150 words)**: Introduce the topic, hook the audience, and naturally introduce the company context.
- **4 to 5 In-Depth Subsections (H2) (~180–200 words each)**:
  - Deep-dive into specific sub-aspects of the topic.
  - Include practical tips, structured bullet points, and real-world examples.
- **Actionable Takeaways / Quick FAQs (~150 words)**: Bulleted summary of high-impact insights.
- **Conclusion & Brand Call-to-Action (~100 words)**: Summary wrapping up the post with a natural CTA on behalf of the company.

### 2. Natural Brand & Tone Injection
- Inject the user-supplied Company Name dynamically into the system prompt:
  ```text
  You are an expert editorial writer crafting authoritative content on behalf of "{company_name}".
  Ensure the tone is informative, engaging, and professional. Naturally reference {company_name} where appropriate in the introduction and conclude with a tailored Call-to-Action.
  ```

### 3. Strict Markdown Output Formatting
- Mandate pure Markdown output with clean heading hierarchy (`#`, `##`, `###`).
- Forbid backtick wrapping around the entire output:
  - Explicit rule: *"Do NOT enclose the entire response in triple backticks (e.g. ```markdown). Start directly with the # H1 title."*
- Ensure standard formatting (bolding, lists, blockquotes) that cleanly renders in `react-markdown`.

### 4. Technical Architecture & Model Selection Rationale
Maintain documentation on the prompt engineering decisions for technical review:
- **Model Selection Rationale**: Explain why Groq (Llama-3.3-70B) or Gemini 2.5 Flash is selected (high tokens/second generation speed, 8k+ output window, and low latency for parallel batch generation).
- **Section-Budgeting Strategy**: Highlight how structural section prompting overcomes the default 400-word completion ceiling without hallucinations.
