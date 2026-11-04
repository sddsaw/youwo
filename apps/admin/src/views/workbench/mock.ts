export const initialCategoryData: Api.Knowledge.CategoryNode[] = [
  {
    id: 'cat-1',
    name: '语料',
    level: 1,
    parentId: null,
    children: [
      { id: 'cat-1-1', name: '标准语料', level: 2, count: 12, parentId: 'cat-1' },
      { id: 'cat-1-2', name: 'legacy 归档', level: 2, count: 50, parentId: 'cat-1' },
    ],
  },
  {
    id: 'cat-2',
    name: '分类',
    level: 1,
    parentId: null,
    children: [
      { id: 'cat-2-1', name: '文件格式', level: 2, count: 21, parentId: 'cat-2' },
      { id: 'cat-2-2', name: '领域概念', level: 2, count: 12, parentId: 'cat-2' },
      { id: 'cat-2-3', name: '生成逻辑', level: 2, count: 11, parentId: 'cat-2' },
      { id: 'cat-2-4', name: 'API 用法', level: 2, count: 9, parentId: 'cat-2' },
      { id: 'cat-2-5', name: '调试经验', level: 2, count: 8, parentId: 'cat-2' },
      { id: 'cat-2-6', name: '分析指标', level: 2, count: 1, parentId: 'cat-2' },
    ],
  },
  {
    id: 'cat-3',
    name: '知识可信状态',
    level: 1,
    parentId: null,
    children: [
      { id: 'cat-3-1', name: '有效', level: 2, count: 10, parentId: 'cat-3' },
      { id: 'cat-3-2', name: '被取代', level: 2, count: 35, parentId: 'cat-3' },
      { id: 'cat-3-3', name: '已过时', level: 2, count: 16, parentId: 'cat-3' },
      { id: 'cat-3-4', name: '未登记', level: 2, count: 1, parentId: 'cat-3' },
    ],
  },
]

export const STATUS_OPTIONS = [
  { label: '全部状态', value: '' },
  { label: '显示', value: 'published' },
  { label: '未显示', value: 'offline' },
]

export const TRUST_STATUS_OPTIONS = [
  { label: '全部状态', value: '' },
  { label: '有效', value: '有效' },
  { label: '被取代', value: '被取代' },
  { label: '已过时', value: '已过时' },
  { label: '未登记', value: '未登记' },
]

export const CONFIDENCE_OPTIONS = [
  { label: '全部置信度', value: '' },
  { label: '高', value: '高' },
  { label: '中', value: '中' },
  { label: '低', value: '低' },
]

export const CATEGORY_OPTIONS = [
  { label: 'API 用法', value: 'API 用法' },
  { label: '文件格式', value: '文件格式' },
  { label: '领域概念', value: '领域概念' },
  { label: '生成逻辑', value: '生成逻辑' },
  { label: '调试经验', value: '调试经验' },
  { label: '分析指标', value: '分析指标' },
]

export const RECOMMEND_OPTIONS = [
  { label: '是', value: true as any },
  { label: '否', value: false as any },
]

export const SHOW_STATUS_OPTIONS = [
  { label: '显示', value: true as any },
  { label: '未显示', value: false as any },
]

export const initialArticleList: Api.Knowledge.ArticleItem[] = [
  {
    id: 1,
    title: '硬件可用 API 范围（红标清单）',
    summary: '生成 TP 只用 [红标清单] 内的硬件 API (72 个 tester hardware APIs，严格限制调用范围，保障机台运行安全)',
    category: 'API 用法',
    confidence: '高',
    trustStatus: '有效',
    lastVerifiedAt: '2026-10-16',
    categoryId: 'cat-2-4',
    visible: true,
    isRecommended: true,
    publisherName: '测试工程架构组',
    contentSource: 'ATE 机台规范库',
    viewCount: 1680,
    publishedAt: '2026-10-16 09:30',
    contentHtml: `
      <h3>1. 红标清单 (Red List) 核心准则</h3>
      <p>为防止在自动生成测试程序 (TP) 过程中调用未校验或高危硬件接口，所有测试流代码必须严格限定在通过合规审查的 72 个标准驱动 API 范围内。</p>
      <ul>
        <li><strong>DPS / PMU 电源控制</strong>：仅允许调用 <code>tester.dps.set_voltage()</code>、<code>tester.pmu.force_i_measure_v()</code> 等带过流保护的接口。</li>
        <li><strong>时钟与 Pin 映射</strong>：禁止直接绕过 Channel Map 操作物理通道寄存器。</li>
        <li><strong>安全校验</strong>：超出清单范围的 API 将在静态审查阶段直接拦截并触发编译告警。</li>
      </ul>
    `,
    attachmentName: 'ATE硬件API红标清单_v2.4.pdf',
    attachmentSize: '2.1 MB',
  },
  {
    id: 2,
    title: 'Pattern User Manual (Memory Pattern 手册)',
    summary: '写 pattern/造向量前必读——Pattern 手册正文 = Memory 测试向量规范、时序与波形转换法则',
    category: 'API 用法',
    confidence: '高',
    trustStatus: '有效',
    lastVerifiedAt: '2026-10-26',
    categoryId: 'cat-2-4',
    visible: true,
    isRecommended: true,
    publisherName: '向量开发组',
    contentSource: 'DFT & ATE 联合规范',
    viewCount: 1420,
    publishedAt: '2026-10-26 14:20',
    contentHtml: `
      <h3>Memory Pattern 编制与时序约束规范</h3>
      <p>本手册规定了嵌入式 SRAM / ROM / Flash 在自动测试机台上的向量转换规则，涵盖 WGL/STIL 到 ATE 专属 Pattern 的编译映射逻辑：</p>
      <ol>
        <li><strong>Timing Waveform 周期对齐</strong>：所有输入 Drive 沿与输出 Strobe 沿必须与 Timing.json 中的时钟域保持同源；</li>
        <li><strong>March C- 算法向量集</strong>：标准 March 算法读写向量序列规范及故障覆盖率统计要求；</li>
        <li><strong>多通道向量压缩</strong>：支持向量重合压制与多 DUT 并行广播模式。</li>
      </ol>
    `,
    attachmentName: 'Memory_Pattern_User_Manual_Rev3.pdf',
    attachmentSize: '4.8 MB',
  },
  {
    id: 3,
    title: 'STDF v4 二进制规范与 Datalog 解析指南',
    summary: 'Standard Test Data Format (STDF) 规范标准、MIR/SDR/PIR/PRR/HBR/SBR 记录定义与分档规则',
    category: '文件格式',
    confidence: '高',
    trustStatus: '有效',
    lastVerifiedAt: '2026-10-28',
    categoryId: 'cat-2-1',
    visible: true,
    isRecommended: false,
    publisherName: '数据分析团队',
    contentSource: '半导体数据工程组',
    viewCount: 960,
    publishedAt: '2026-10-28 16:00',
    contentHtml: `
      <h3>STDF v4 二进制日志数据结构</h3>
      <p>STDF 是全球半导体晶圆测试 (CP) 与成品测试 (FT) 事实上的标准数据格式：</p>
      <ul>
        <li><strong>Header 记录</strong>：MIR (Master Information Record) 包含 Lot ID、Part Type、Operator 等批次信息；</li>
        <li><strong>测试结果</strong>：PTR (Parametric Test Record) 记录模拟/直流参数测量值、测试上下限；FTR (Functional Test Record) 记录功能向量 PASS/FAIL；</li>
        <li><strong>分选与 Bin 汇总</strong>：HBR (Hard Bin Record) 与 SBR (Soft Bin Record) 统计各良率与失效分类。</li>
      </ul>
    `,
    attachmentName: 'STDF_v4_Specification_Summary.pdf',
    attachmentSize: '3.2 MB',
  },
  {
    id: 4,
    title: 'DC Continuity 开短路与 ESD 保护二极管测试规范',
    summary: 'ESD 保护二极管导通测试、加压测流 (PMU Force Current Measure Voltage) 与钳位保护',
    category: '生成逻辑',
    confidence: '高',
    trustStatus: '有效',
    lastVerifiedAt: '2026-10-22',
    categoryId: 'cat-2-3',
    visible: true,
    isRecommended: true,
    publisherName: '芯片测试应用部',
    contentSource: 'ATE 测试基础库',
    viewCount: 1120,
    publishedAt: '2026-10-22 11:15',
    contentHtml: `
      <h3>开短路测试 (OS / Continuity) 标准流程</h3>
      <p>测试芯片管脚与探针/插座的物理接触良率及防静电保护二极管完整性：</p>
      <ul>
        <li>加压测流条件：Force \(I = -100\mu A\)，钳位电压 Clamp \(V = -1.5V\)；</li>
        <li>判据基线：\( -0.8V \le V_{meas} \le -0.2V \)（正常二极管 PN 结正向导通）；</li>
        <li>异常判定：\( V_{meas} < -1.2V \) 判定为开路 (Open/接触不良)；\( |V_{meas}| < 0.1V \) 判定为短路 (Short)。</li>
      </ul>
    `,
    attachmentName: 'Continuity_Testing_Standard.pdf',
    attachmentSize: '1.5 MB',
  },
  {
    id: 5,
    title: 'ATE 机台 V93000 / Teradyne J750 常用驱动 API 对照表',
    summary: '主流半导体机台硬件抽象层 HAL 映射、PMU 加压测流与 Digital Pin 驱动语法差异',
    category: 'API 用法',
    confidence: '中',
    trustStatus: '有效',
    lastVerifiedAt: '2026-10-18',
    categoryId: 'cat-2-4',
    visible: true,
    isRecommended: false,
    publisherName: '测试工程架构组',
    contentSource: '平台驱动适配中心',
    viewCount: 880,
    publishedAt: '2026-10-18 17:30',
    contentHtml: `
      <h3>跨机台 API 抽象与封装基线</h3>
      <p>针对 Advantest V93000 (SmarTest 7/8) 与 Teradyne J750 (IG-XL) 进行函数映射封装，确保上层测试流统一。</p>
    `,
    attachmentName: 'Cross_ATE_Platform_API_Mapping.pdf',
    attachmentSize: '2.7 MB',
  },
  {
    id: 6,
    title: 'IDDQ 静态漏电流测试与向量停滞周期经验总结',
    summary: '深亚微米 CMOS 静态功耗异常排查、向量停滞周期选择与内建自测 BIST 漏电分析',
    category: '调试经验',
    confidence: '中',
    trustStatus: '被取代',
    lastVerifiedAt: '2026-09-15',
    categoryId: 'cat-2-5',
    visible: true,
    isRecommended: false,
    publisherName: '资深调试专家',
    contentSource: '现场排障总结',
    viewCount: 750,
    publishedAt: '2026-09-15 15:45',
    contentHtml: `
      <h3>IDDQ 调试建议 (注意：已被微安级高精度动态采样准则取代)</h3>
      <p>静态功耗采样需等待内部寄生电容充放电稳定后再触发测量，避免因毛刺引起误判。</p>
    `,
  },
  {
    id: 7,
    title: 'Legacy 早期测试流编排规范 (v1.2 已废弃)',
    summary: '旧版自动化脚本 TestFlow 编排逻辑，已被当前微架构可视化工作流取代',
    category: '生成逻辑',
    confidence: '低',
    trustStatus: '已过时',
    lastVerifiedAt: '2026-06-10',
    categoryId: 'cat-2-3',
    visible: false,
    isRecommended: false,
    publisherName: '测试工程历史归档',
    contentSource: '历史版本库',
    viewCount: 310,
    publishedAt: '2026-06-10 10:00',
    contentHtml: `
      <p>本条目仅作向后兼容性历史追溯，新程序严禁采用 v1.2 编排结构。</p>
    `,
  },
  {
    id: 8,
    title: 'Shmoo 动态时序与工作电压扫描经验库',
    summary: 'VCC vs Freq 边界扫描条件设置、PASS/FAIL 悬崖效应与芯片速度档位特征提取',
    category: '调试经验',
    confidence: '高',
    trustStatus: '有效',
    lastVerifiedAt: '2026-10-30',
    categoryId: 'cat-2-5',
    visible: true,
    isRecommended: true,
    publisherName: '芯片表征验证组',
    contentSource: '实验室表征手册',
    viewCount: 1350,
    publishedAt: '2026-10-30 18:20',
    contentHtml: `
      <h3>Shmoo Plot 扫描二维表征基线</h3>
      <p>通过步进改变工作电压与时钟周期，绘制 PASS/FAIL 边界图，量化工作裕量 (Margin)。</p>
    `,
  },
  {
    id: 9,
    title: 'CP/FT 量产测试良率分析与制程能力指标 Cpk 计算',
    summary: '量产阶段测试项统计分布评估、离群值甄别（Part Average Testing）与良率监控',
    category: '分析指标',
    confidence: '高',
    trustStatus: '有效',
    lastVerifiedAt: '2026-11-01',
    categoryId: 'cat-2-6',
    visible: true,
    isRecommended: true,
    publisherName: '质量与良率管控部',
    contentSource: '量产工程规范',
    viewCount: 1530,
    publishedAt: '2026-11-01 09:10',
    contentHtml: `
      <h3>Cpk 关键性能指标计算法则</h3>
      <p>量产芯片要求关键电气参数测试 Cpk 不低于 1.33：</p>
      <p>$$C_{pk} = \\min\\left(\\frac{\\text{USL} - \\mu}{3\\sigma}, \\frac{\\mu - \\text{LSL}}{3\\sigma}\\right) \\ge 1.33$$</p>
    `,
  },
  {
    id: 10,
    title: '半导体测试基础概念：OS / Leakage / Functional / AC Timing',
    summary: '芯片测试工程全生命周期核心专业术语、开短路/漏电/功能/动态交流参数基本定义',
    category: '领域概念',
    confidence: '高',
    trustStatus: '有效',
    lastVerifiedAt: '2026-10-12',
    categoryId: 'cat-2-2',
    visible: true,
    isRecommended: true,
    publisherName: '测试工程学院',
    contentSource: '新员工入职培训手册',
    viewCount: 2200,
    publishedAt: '2026-10-12 10:00',
    contentHtml: `
      <h3>半导体测试 4 大核心领域划分</h3>
      <ol>
        <li><strong>开短路与接触 (Continuity / OS)</strong>：检测物理连接与保护二极管。</li>
        <li><strong>漏电流 (Leakage)</strong>：检测输入高阻、输出三态及栅氧完整性。</li>
        <li><strong>功能验证 (Functional)</strong>：在目标频率下执行逻辑/算法向量，验证逻辑门状态。</li>
        <li><strong>交流时序 (AC Timing)</strong>：验证建立时间 (Setup)、保持时间 (Hold)、传输延迟 (Tpd) 等。</li>
      </ol>
    `,
  },
]
