"""
FastAPI Backend - Nexus Agent API Endpoints
"""

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List
import asyncio
import json
from datetime import datetime
import uuid

app = FastAPI(title="Nexus Agent API", version="1.0.0")

# Pydantic Models for Request/Response
class AgentQueryRequest(BaseModel):
    """
    Request model for agent query execution
    """
    query: str = Field(
        ..., 
        description="The financial analysis query to process",
        example="Compare the Q3 2024 revenue growth of NVIDIA and AMD, and then draft a summary email to my manager about which stock is a better buy right now, citing a key risk for each."
    )
    user_id: Optional[str] = Field(
        None,
        description="Optional user identifier for session tracking"
    )
    preferences: Optional[Dict[str, Any]] = Field(
        None,
        description="User preferences for tone, format, etc."
    )
    streaming: bool = Field(
        True,
        description="Whether to stream real-time progress updates"
    )

class AgentStep(BaseModel):
    """
    Model for individual ReAct steps
    """
    step_number: int
    thought: str
    action: Dict[str, Any]
    observation: str
    timestamp: datetime
    status: str  # "in_progress", "completed", "error"

class AgentResponse(BaseModel):
    """
    Final response model
    """
    session_id: str
    query: str
    steps: List[AgentStep]
    final_result: Dict[str, Any]
    execution_time_seconds: float
    status: str

# Main API Endpoint
@app.post("/api/agent/run")
async def run_nexus_agent(request: AgentQueryRequest):
    """
    Primary endpoint to execute Nexus Agent financial analysis queries.
    
    This endpoint accepts a natural language query about financial markets and
    executes the ReAct (Reasoning and Acting) workflow to provide comprehensive
    analysis including data retrieval, risk assessment, and content generation.
    
    Args:
        request (AgentQueryRequest): The query request containing the user's question
    
    Returns:
        StreamingResponse: Server-sent events stream of agent progress if streaming=True
        AgentResponse: Complete response object if streaming=False
    """
    
    session_id = str(uuid.uuid4())
    start_time = datetime.now()
    
    if request.streaming:
        # Return SSE stream for real-time updates
        return StreamingResponse(
            stream_agent_execution(session_id, request),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Session-ID": session_id
            }
        )
    else:
        # Return complete response after execution
        try:
            result = await execute_agent_workflow(session_id, request)
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

async def stream_agent_execution(session_id: str, request: AgentQueryRequest):
    """
    Generator function that streams real-time agent progress using Server-Sent Events (SSE).
    
    SSE was chosen over WebSockets because:
    1. Simpler implementation for one-way communication (server -> client)
    2. Automatic reconnection handling by browsers
    3. Better compatibility with HTTP infrastructure (proxies, load balancers)
    4. No need for bidirectional communication during execution
    5. Built-in browser support without additional libraries
    
    Args:
        session_id (str): Unique session identifier
        request (AgentQueryRequest): The original query request
    
    Yields:
        str: Server-sent event formatted strings with agent progress
    """
    
    try:
        # Send initial connection confirmation
        yield f"data: {json.dumps({'type': 'session_start', 'session_id': session_id, 'query': request.query})}\n\n"
        
        # Simulate ReAct execution steps (in production, this would call actual tools)
        steps = [
            {
                "step": 1,
                "thought": "I need to gather Q3 2024 financial data for NVIDIA first to compare revenue growth.",
                "action": {"tool": "get_financial_data", "symbol": "NVDA", "period": "Q3 2024"},
                "status": "in_progress"
            },
            {
                "step": 1,
                "observation": "Retrieved NVIDIA Q3 2024: Revenue $35.08B, +94% YoY growth",
                "status": "completed"
            },
            {
                "step": 2,
                "thought": "Now I need AMD's Q3 2024 data for comparison.",
                "action": {"tool": "get_financial_data", "symbol": "AMD", "period": "Q3 2024"},
                "status": "in_progress"
            },
            {
                "step": 2,
                "observation": "Retrieved AMD Q3 2024: Revenue $6.82B, +18% YoY growth",
                "status": "completed"
            },
            {
                "step": 3,
                "thought": "I need to analyze risks for both stocks to provide balanced recommendation.",
                "action": {"tool": "analyze_investment_risks", "symbols": ["NVDA", "AMD"]},
                "status": "in_progress"
            },
            {
                "step": 3,
                "observation": "Risk analysis: NVDA (35/100 risk) - AI bubble concerns; AMD (45/100 risk) - competition",
                "status": "completed"
            },
            {
                "step": 4,
                "thought": "Now I'll generate the email draft with comparison and recommendation.",
                "action": {"tool": "generate_text_output", "content_type": "email_draft"},
                "status": "in_progress"
            },
            {
                "step": 4,
                "observation": "Generated professional email (247 words) with NVIDIA buy recommendation",
                "status": "completed"
            }
        ]
        
        # Stream each step with realistic delays
        for step_data in steps:
            yield f"data: {json.dumps({'type': 'step_update', **step_data, 'timestamp': datetime.now().isoformat()})}\n\n"
            await asyncio.sleep(1.5)  # Simulate processing time
        
        # Send final result
        final_result = {
            "type": "execution_complete",
            "session_id": session_id,
            "final_result": {
                "comparison": "NVIDIA: $35.08B (+94%) vs AMD: $6.82B (+18%)",
                "recommendation": "NVIDIA - Superior growth and AI market position",
                "email_draft": "Professional email generated with risk analysis and buy recommendation",
                "key_risks": {
                    "NVIDIA": "AI bubble concerns and China export restrictions",
                    "AMD": "CPU market competition and datacenter dependency"
                }
            },
            "execution_time": "6.2 seconds",
            "status": "completed"
        }
        
        yield f"data: {json.dumps(final_result)}\n\n"
        
    except Exception as e:
        error_data = {
            "type": "error",
            "session_id": session_id,
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }
        yield f"data: {json.dumps(error_data)}\n\n"

async def execute_agent_workflow(session_id: str, request: AgentQueryRequest) -> AgentResponse:
    """
    Execute the complete agent workflow and return final results.
    
    This function orchestrates the ReAct pattern execution including:
    1. Query parsing and planning
    2. Tool execution (financial data, risk analysis, text generation)
    3. Result synthesis and formatting
    
    Args:
        session_id (str): Unique session identifier
        request (AgentQueryRequest): The query request
    
    Returns:
        AgentResponse: Complete execution results
    """
    
    start_time = datetime.now()
    
    # In production, this would execute the actual ReAct workflow
    # For now, return mock results matching the expected structure
    
    steps = [
        AgentStep(
            step_number=1,
            thought="I need to gather Q3 2024 financial data for NVIDIA and AMD to compare revenue growth.",
            action={"tool": "get_financial_data", "symbol": "NVDA", "period": "Q3 2024"},
            observation="Retrieved NVIDIA Q3 2024: Revenue $35.08B with 94% year-over-year growth",
            timestamp=datetime.now(),
            status="completed"
        ),
        # Additional steps would be added here...
    ]
    
    final_result = {
        "comparison_summary": "NVIDIA significantly outperformed AMD in Q3 2024 revenue growth",
        "recommendation": "NVIDIA is the better buy based on superior growth metrics",
        "email_draft_generated": True,
        "risks_analyzed": True
    }
    
    execution_time = (datetime.now() - start_time).total_seconds()
    
    return AgentResponse(
        session_id=session_id,
        query=request.query,
        steps=steps,
        final_result=final_result,
        execution_time_seconds=execution_time,
        status="completed"
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

# Agent status endpoint
@app.get("/api/agent/status/{session_id}")
async def get_agent_status(session_id: str):
    """Get the status of a specific agent execution session"""
    # In production, this would query session storage (Redis, database)
    return {"session_id": session_id, "status": "not_implemented"}
