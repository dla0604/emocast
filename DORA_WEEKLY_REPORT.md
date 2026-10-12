# 📊 주간 DORA 지표 리포트
**기준일:** 2026-10-12

## 🚀 4대 핵심 지표 요약
* **Deployment Frequency (배포 빈도):** 5 times/week
* **Lead Time for Changes (변경 리드 타임):** 12 hours
* **MTTR (평균 복구 시간):** 2 hours
* **Change Failure Rate (변경 실패율):** 15%

## 📈 대시보드 시안 (Chart.js 랜더링)
![DORA Metrics Dashboard](https://quickchart.io/chart?c=
{
type:'radar',
data:{
labels:['DeploymentFreq','LeadTime','MTTR','ChangeFailureRate'],
datasets:[{
label:'TeamPerformance',
data:[80,70,90,85],
backgroundColor:'rgba(54,162,235,0.2)',
borderColor:'rgba(54,162,235,1)'
}]
}
}
)

> **참고:** 전체 상세 데이터는 GitHub Actions 탭의 `dora-metrics-json` 아티팩트에서 다운로드할 수 있습니다.
