import json
import datetime
import os

# 1. DORA 지표 데이터 생성 (실무에서는 GitHub API를 호출하여 계산)
today = datetime.date.today()
metrics_data = {
    "date": str(today),
    "metrics": {
        "deployment_frequency": "5 times/week",
        "lead_time_for_changes": "12 hours",
        "mttr": "2 hours",
        "change_failure_rate": "15%"
    }
}

# 2. JSON 아티팩트로 저장 (선택 과제 달성)
with open('dora_metrics.json', 'w') as f:
    json.dump(metrics_data, f, indent=4)

# 3. Chart.js 기반의 동적 이미지 URL 생성 (QuickChart API 활용)
# 대시보드 시안을 README나 리포트에 띄우기 위함
chart_config = """
{
  type: 'radar',
  data: {
    labels: ['Deployment Freq', 'Lead Time', 'MTTR', 'Change Failure Rate'],
    datasets: [{
      label: 'Team Performance',
      data: [80, 70, 90, 85],
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)'
    }]
  }
}
"""
# 띄어쓰기를 URL 인코딩 형식으로 간단히 처리
chart_url = f"https://quickchart.io/chart?c={chart_config.replace(' ', '')}"

# 4. 주간 보고서 (Markdown) 자동 생성
report_content = f"""# 📊 주간 DORA 지표 리포트
**기준일:** {today}

## 🚀 4대 핵심 지표 요약
* **Deployment Frequency (배포 빈도):** {metrics_data['metrics']['deployment_frequency']}
* **Lead Time for Changes (변경 리드 타임):** {metrics_data['metrics']['lead_time_for_changes']}
* **MTTR (평균 복구 시간):** {metrics_data['metrics']['mttr']}
* **Change Failure Rate (변경 실패율):** {metrics_data['metrics']['change_failure_rate']}

## 📈 대시보드 시안 (Chart.js 랜더링)
![DORA Metrics Dashboard]({chart_url})

> **참고:** 전체 상세 데이터는 GitHub Actions 탭의 `dora-metrics-json` 아티팩트에서 다운로드할 수 있습니다.
"""

with open('DORA_WEEKLY_REPORT.md', 'w') as f:
    f.write(report_content)

print("✅ JSON artifact and Markdown report generated successfully.")