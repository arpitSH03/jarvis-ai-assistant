import pytest
from pathlib import Path
from app.tools.registry import registry
from app.tools.study_tools import ExplainConceptTool, GenerateQuizTool, CreateDocxTool
from app.core.config import settings

@pytest.mark.asyncio
async def test_explain_concept():
    tool = ExplainConceptTool()
    res = await tool.execute(topic="Binary Search Tree", subject="Data Structures")
    assert res.success is True
    assert "Binary Search Tree" in res.data["explanation"]

@pytest.mark.asyncio
async def test_generate_quiz():
    tool = GenerateQuizTool()
    res = await tool.execute(subject="Operating Systems", num_questions=2)
    assert res.success is True
    assert len(res.data["questions"]) == 2

@pytest.mark.asyncio
async def test_create_docx():
    tool = CreateDocxTool()
    filename = "test_study_notes.docx"
    res = await tool.execute(
        title="Test Algorithm Notes",
        content="## Section 1\nSorting algorithms.\n- QuickSort\n- MergeSort",
        filename=filename
    )
    assert res.success is True
    target_file = settings.OUTPUTS_DIR / filename
    assert target_file.exists()
    assert res.verified is True
