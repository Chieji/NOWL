"""
Nexus Agent - 5-Step ReAct Execution Sequence
Sample Query: "Compare the Q3 2024 revenue growth of NVIDIA and AMD, and then draft 
a summary email to my manager about which stock is a better buy right now, citing 
a key risk for each."
"""

# ReAct (Reasoning and Acting) Pattern Execution Sequence
react_execution_sequence = [
    {
        "step": 1,
        "thought": "The user wants me to compare Q3 2024 revenue growth between NVIDIA (NVDA) and AMD, then create an email summary with buy recommendation and key risks. I need to start by gathering the Q3 2024 financial data for both companies to compare their revenue growth rates.",
        "action": {
            "tool": "get_financial_data",
            "parameters": {
                "symbol": "NVDA",
                "data_type": "quarterly_financials", 
                "period": "Q3 2024",
                "metrics": ["revenue", "revenue_growth", "year_over_year_growth"]
            }
        },
        "observation": "Retrieved NVIDIA Q3 2024 data: Revenue of $35.08B with 94% year-over-year growth. This represents significant growth compared to Q3 2023 revenue of $18.12B. The growth is primarily driven by their AI/datacenter business segment."
    },
    {
        "step": 2,
        "thought": "Now I have NVIDIA's Q3 2024 revenue data showing impressive 94% YoY growth. I need to get the same data for AMD to make a proper comparison between the two companies.",
        "action": {
            "tool": "get_financial_data",
            "parameters": {
                "symbol": "AMD",
                "data_type": "quarterly_financials",
                "period": "Q3 2024", 
                "metrics": ["revenue", "revenue_growth", "year_over_year_growth"]
            }
        },
        "observation": "Retrieved AMD Q3 2024 data: Revenue of $6.82B with 18% year-over-year growth compared to Q3 2023 revenue of $5.80B. Growth is more modest, driven by datacenter and embedded processor sales, but CPU market remains competitive."
    },
    {
        "step": 3,
        "thought": "I now have the revenue comparison: NVIDIA ($35.08B, +94% YoY) significantly outperformed AMD ($6.82B, +18% YoY) in Q3 2024. However, to make a proper investment recommendation, I need to analyze the key risks associated with each stock to provide a balanced view in my email.",
        "action": {
            "tool": "analyze_investment_risks",
            "parameters": {
                "symbols": ["NVDA", "AMD"],
                "analysis_timeframe": "3_months",
                "risk_categories": ["market_risk", "sector_risk", "regulatory_risk", "competitive_risk"],
                "include_sentiment": True
            }
        },
        "observation": "Risk analysis completed: NVIDIA shows moderate risk (score: 35/100) with key concerns around AI bubble speculation and China export restrictions. AMD shows higher risk (score: 45/100) with concerns about CPU market competition and data center dependency. Both face semiconductor cycle volatility."
    },
    {
        "step": 4,
        "thought": "I have comprehensive data: NVIDIA's superior revenue growth (94% vs 18%), risk assessment, and key risk factors for both companies. NVIDIA appears to be the stronger performer but with AI-specific risks. AMD has more modest growth but faces competitive pressures. Now I need to synthesize this into a professional email for the user's manager.",
        "action": {
            "tool": "generate_text_output",
            "parameters": {
                "content_type": "email_draft",
                "context_data": {
                    "comparison_data": {
                        "NVDA": {"revenue": "$35.08B", "growth": "94%", "key_risk": "AI bubble concerns and China export restrictions"},
                        "AMD": {"revenue": "$6.82B", "growth": "18%", "key_risk": "CPU market competition and datacenter dependency"}
                    },
                    "recommendation": "NVDA",
                    "reasoning": "superior revenue growth and market position in AI"
                },
                "recipient": "manager",
                "tone": "professional"
            }
        },
        "observation": "Generated professional email draft (247 words) with clear Q3 2024 comparison, NVIDIA buy recommendation based on 94% growth vs AMD's 18%, and key risk factors highlighted for both stocks. Email includes executive summary format suitable for management review."
    },
    {
        "step": 5,
        "thought": "I have successfully completed the multi-step analysis requested by the user. I gathered Q3 2024 revenue data for both NVIDIA and AMD, performed risk analysis, and generated a comprehensive email draft with buy recommendation and key risks. The analysis shows NVIDIA's significantly stronger revenue growth (94% vs 18%) supporting a buy recommendation, while acknowledging key risks for both companies. The task is complete.",
        "action": {
            "tool": "final_response",
            "parameters": {
                "summary": "Analysis complete: NVIDIA Q3 2024 revenue growth (94%) significantly outperformed AMD (18%). Risk analysis and professional email draft generated with buy recommendation for NVIDIA, citing key risks for both stocks.",
                "deliverable": "email_draft_ready_for_review"
            }
        },
        "observation": "Task completed successfully. User now has comprehensive Q3 2024 revenue comparison, risk analysis, and professional email draft ready to send to their manager with clear investment recommendation and risk considerations."
    }
]
