// 개발용 도구의 스위치. 밸런스 시뮬레이션(/dev/sim)은 밸런스를 확정하면서 잠가 두었다.(false)
// 다시 돌리려면 true로 바꾼다. 켜면 개발 서버에서만 홈의 링크와 라우트가 열린다 (배포 빌드에는 어느 쪽도 없다).
export const SIMULATION_PAGE_ENABLED = true

/** 시뮬레이션 페이지가 열려 있는지 (개발 서버이면서 스위치가 켜져 있을 때) */
export const isSimulationPageOpen = import.meta.env.DEV && SIMULATION_PAGE_ENABLED
