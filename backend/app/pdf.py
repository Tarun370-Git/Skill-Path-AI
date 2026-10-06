from io import BytesIO
import json
import logging
from xml.sax.saxutils import escape
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

logger = logging.getLogger(__name__)

def _safe_text(value) -> str:
    return escape(str(value or ""))

def generate_pdf_report(roadmap_obj) -> BytesIO:
    """
    Generates a professional PDF roadmap using reportlab flowables.
    Returns a BytesIO stream containing the PDF binary.
    """
    try:
        data = json.loads(roadmap_obj.roadmap_json)
    except Exception as e:
        logger.error(f"Failed to parse roadmap JSON: {e}")
        data = {}

    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=54,
        leftMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    
    styles = getSampleStyleSheet()
    
    # Curated modern palette matching web interface
    PRIMARY_COLOR = colors.HexColor("#1e293b")   # Slate 800
    SECONDARY_COLOR = colors.HexColor("#0f766e") # Teal 700
    TEXT_COLOR = colors.HexColor("#334155")      # Slate 700
    BG_COLOR = colors.HexColor("#f8fafc")        # Slate 50
    BORDER_COLOR = colors.HexColor("#e2e8f0")    # Slate 200
    
    # Custom Paragraph Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=PRIMARY_COLOR,
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#64748b"),
        spaceAfter=15
    )
    
    h1_style = ParagraphStyle(
        'SectionHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=SECONDARY_COLOR,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )
    
    h2_style = ParagraphStyle(
        'SubSectionHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=PRIMARY_COLOR,
        spaceBefore=8,
        spaceAfter=6,
        keepWithNext=True
    )
    
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=TEXT_COLOR,
        spaceAfter=4
    )
    
    bullet_style = ParagraphStyle(
        'DocBullet',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=TEXT_COLOR,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=3
    )
    
    header_cell_style = ParagraphStyle(
        'HeaderCell',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=colors.white
    )
    
    story = []
    
    # Header Section
    story.append(Paragraph("SkillPath AI", title_style))
    story.append(Paragraph(f"Personalized Career Roadmap for <b>{_safe_text(roadmap_obj.dream_job)}</b>", subtitle_style))
    story.append(Spacer(1, 0.1 * inch))
    
    # Profile & Summary table
    created_str = roadmap_obj.created_at.strftime("%Y-%m-%d") if hasattr(roadmap_obj.created_at, "strftime") else str(roadmap_obj.created_at)
    meta_data = [
        [
            Paragraph("<b>Target Role:</b>", body_style), Paragraph(_safe_text(roadmap_obj.dream_job), body_style),
            Paragraph("<b>Date Generated:</b>", body_style), Paragraph(created_str, body_style)
        ],
        [
            Paragraph("<b>Current Skills:</b>", body_style), Paragraph(_safe_text(roadmap_obj.current_skills), body_style),
            Paragraph("<b>Readiness Score:</b>", body_style), Paragraph(f"<b>{roadmap_obj.readiness_score}/100</b>", body_style)
        ]
    ]
    t_meta = Table(meta_data, colWidths=[1.2*inch, 2.3*inch, 1.3*inch, 1.7*inch])
    t_meta.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_COLOR),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
    ]))
    story.append(t_meta)
    story.append(Spacer(1, 0.2 * inch))
    
    # Skill Gap Section
    story.append(Paragraph("Skill Gap Analysis", h1_style))
    
    gap_data = [
        [
            Paragraph("Existing Skills", header_cell_style), 
            Paragraph("Missing Skills (Gap)", header_cell_style), 
            Paragraph("High Priority to Learn", header_cell_style)
        ],
        [
            Paragraph("<br/>".join([f"&bull; {_safe_text(s)}" for s in data.get("existing_skills", [])]) or "None specified", body_style),
            Paragraph("<br/>".join([f"&bull; {_safe_text(s)}" for s in data.get("missing_skills", [])]) or "None identified", body_style),
            Paragraph("<br/>".join([f"&bull; {_safe_text(s)}" for s in data.get("priority_skills", [])]) or "None identified", body_style)
        ]
    ]
    t_gap = Table(gap_data, colWidths=[2.16*inch, 2.16*inch, 2.18*inch])
    t_gap.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), SECONDARY_COLOR),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('PADDING', (0,0), (-1,-1), 8),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
    ]))
    story.append(t_gap)
    story.append(Spacer(1, 0.2 * inch))
    
    # 8-Week Timeline Section
    story.append(Paragraph("8-Week Actionable Learning Roadmap", h1_style))
    
    for wk in data.get("roadmap", []):
        wk_num = wk.get("week_number")
        wk_title = wk.get("topic")
        wk_tasks = wk.get("tasks", [])
        wk_proj = wk.get("mini_project")
        wk_res = wk.get("resources", [])
        
        # Build Week Container Flowables
        week_flowables = []
        week_flowables.append(Paragraph(f"Week {_safe_text(wk_num)}: {_safe_text(wk_title)}", h2_style))
        
        week_flowables.append(Paragraph("<b>Weekly Learning Tasks:</b>", body_style))
        for task in wk_tasks:
            week_flowables.append(Paragraph(f"&bull; {_safe_text(task)}", bullet_style))
            
        week_flowables.append(Paragraph(f"<b>Weekly Mini Project:</b> {_safe_text(wk_proj)}", body_style))
        
        if wk_res:
            week_flowables.append(Paragraph("<b>Recommended Free Resources:</b>", body_style))
            for res in wk_res:
                week_flowables.append(Paragraph(f"&bull; {_safe_text(res)}", bullet_style))
                
        week_flowables.append(Spacer(1, 0.12 * inch))
        story.append(KeepTogether(week_flowables))
        
    # Preparation & Portfolios Section
    prep_flowables = []
    prep_flowables.append(Spacer(1, 0.1 * inch))
    prep_flowables.append(Paragraph("Portfolio Projects to Build", h1_style))
    for proj in data.get("portfolio_projects", []):
        prep_flowables.append(Paragraph(f"&bull; <b>{_safe_text(proj)}</b>", bullet_style))
        
    prep_flowables.append(Paragraph("Key Interview Preparation Topics", h1_style))
    for topic in data.get("interview_topics", []):
        prep_flowables.append(Paragraph(f"&bull; {_safe_text(topic)}", bullet_style))
        
    prep_flowables.append(Paragraph("Recommended Industry Certifications", h1_style))
    for cert in data.get("certifications", []):
        prep_flowables.append(Paragraph(f"&bull; {_safe_text(cert)}", bullet_style))
        
    story.append(KeepTogether(prep_flowables))
    
    # Build Document
    doc.build(story)
    buffer.seek(0)
    return buffer
