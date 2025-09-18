import React, { useState, useEffect, useRef } from 'react';
import mermaid from 'mermaid';
import { 
  Layout, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Upload, 
  Steps,
  Timeline,
  Tabs,
  Tag,
  Space,
  Divider,
  Progress,
  Alert,
  message,
  Modal,
  Descriptions,
  Form,
  Input,
  Select,
  Menu,
  List,
  Tree,
  Badge,
  Tooltip,
  Collapse,
  Table,
  Drawer
} from 'antd';
import { 
  UploadOutlined, 
  FileTextOutlined, 
  BarChartOutlined,
  UserOutlined,
  HeartOutlined,
  TeamOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  PlusOutlined,
  EditOutlined,
  EyeOutlined,
  AudioOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  CheckOutlined,
  AppstoreOutlined,
  SortAscendingOutlined,
  NodeIndexOutlined,
  SettingOutlined,
  SyncOutlined,
  FileSearchOutlined,
  CloudUploadOutlined,
  FileImageOutlined,
  VideoCameraOutlined,
  FilePdfOutlined,
  TableOutlined,
  ApiOutlined,
  FormOutlined,
  SyncOutlined as SyncIcon,
  DeleteOutlined,
  EyeOutlined as PreviewIcon,
  CheckCircleOutlined as SuccessIcon,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  MobileOutlined,
  DesktopOutlined,
  ImportOutlined,
  ExportOutlined,
  SaveOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { healthAPI } from '../services/api';

const { Header, Content, Sider } = Layout;
const { Title, Text, Paragraph } = Typography;
const { Step } = Steps;
// const { TabPane } = Tabs; // 不再使用TabPane，使用items属性
const { TextArea } = Input;
const { Option } = Select;
const { Panel } = Collapse;

const HealthResumeSystem = () => {
  // 添加调试日志
  console.log('🚀 HealthResumeSystem 组件已加载');
  console.log('📍 当前URL:', window.location.href);
  console.log('📍 当前路径:', window.location.pathname);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [healthResume, setHealthResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisCompleted, setAnalysisCompleted] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');
  const [recognitionAccuracy, setRecognitionAccuracy] = useState(0);
  const [selectedTheme, setSelectedTheme] = useState('overview');
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('stage1');
  const [selectedPlanForDetail, setSelectedPlanForDetail] = useState(null);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(1); // 默认选中方案二（索引1）
  const [showPlanDetail, setShowPlanDetail] = useState(false); // 控制是否显示方案详情页面
  const [form] = Form.useForm();
  
  // 框架构建相关状态
  const [frameworkActiveTab, setFrameworkActiveTab] = useState('modules');
  const [selectedModule, setSelectedModule] = useState(null);
  const [selectedModuleForFlowchart, setSelectedModuleForFlowchart] = useState(null);
  const [isAddingModule, setIsAddingModule] = useState(false);
  const [isEditingModule, setIsEditingModule] = useState(false);
  const [frameworkForm] = Form.useForm();
  const [moduleForm] = Form.useForm();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [frameworkLoading, setFrameworkLoading] = useState(false);
  
  // 置信度评估相关状态
  const [confidenceEvaluating, setConfidenceEvaluating] = useState(false);
  const [confidenceResults, setConfidenceResults] = useState({});
  const [showConfidencePanel, setShowConfidencePanel] = useState(false);
  const [confidenceLogs, setConfidenceLogs] = useState([]);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);
  const [activeTab, setActiveTab] = useState('biomedical');
  
  // 置信度评估数据
  const confidenceEvaluationData = {
    biomedical: [
      { content: "超重（BMI 25.9）→ 体脂分布异常 → 腹腔内脂肪堆积", confidence: 95, level: "极高", evidence: "A级" },
      { content: "工作压力大 → HPA轴激活 → 皮质醇持续分泌↑", confidence: 90, level: "极高", evidence: "A级" },
      { content: "疲劳感增加 → 交感神经持续兴奋 → 心率↑、血压↑", confidence: 85, level: "高", evidence: "B级" },
      { content: "长期压力 + 睡眠质量下降 → 免疫功能抑制", confidence: 80, level: "高", evidence: "B级" },
      { content: "超重 → 脂肪细胞因子分泌异常 → 诱发胰岛素抵抗", confidence: 75, level: "高", evidence: "B级" },
      { content: "睡眠剥夺 → 下丘脑食欲调节因子失衡", confidence: 85, level: "高", evidence: "A级" },
      { content: "压力应激 → 端粒酶活性下降 → 细胞衰老加速", confidence: 70, level: "中高", evidence: "C级" },
      { content: "慢性压力 → Th1/Th2细胞失衡 → 促炎因子分泌↑", confidence: 80, level: "高", evidence: "B级" },
      { content: "若携带FTO基因变异 → 肥胖易感性增加", confidence: 60, level: "中等", evidence: "C级" },
      { content: "COMT基因多态性 → 影响多巴胺代谢", confidence: 65, level: "中等", evidence: "C级" }
    ],
    psychological: [
      { content: "疲劳 + 工作压力 → 抑郁焦虑量表评估 → 轻度抑郁或焦虑障碍", confidence: 85, level: "高", evidence: "B级" },
      { content: "睡眠障碍 → 生物钟紊乱 → 双向情感障碍早期症状排查", confidence: 75, level: "高", evidence: "B级" },
      { content: "压力认知评估 → 非理性信念 → 认知行为疗法修正", confidence: 80, level: "高", evidence: "B级" },
      { content: "健康话题职场禁忌+情绪压抑 → 心理健康咨询利用率<5%", confidence: 90, level: "极高", evidence: "A级" },
      { content: "心理压力 → 自主神经功能紊乱 → 胃肠道症状", confidence: 75, level: "高", evidence: "B级" },
      { content: "IT行业工作压力 → 焦虑情绪增加 → 睡眠质量下降", confidence: 85, level: "高", evidence: "A级" },
      { content: "已婚育状态 → 家庭责任压力 → 心理负荷增加", confidence: 80, level: "高", evidence: "B级" }
    ],
    social: [
      { content: "技术更新快 → 加班挤占学习时间 → 新技术学习滞后", confidence: 90, level: "极高", evidence: "A级" },
      { content: "长时间工作+持续应激状态 → 皮质醇水平持续升高", confidence: 85, level: "高", evidence: "A级" },
      { content: "本科学历+行业竞争焦虑 → 主动延长工作时长", confidence: 80, level: "高", evidence: "B级" },
      { content: "\"带病工作光荣\"观念+peer pressure → 病假申请率<50%", confidence: 95, level: "极高", evidence: "A级" },
      { content: "个体内卷行为+行业模仿效应 → 群体工作时长普遍化", confidence: 85, level: "高", evidence: "B级" },
      { content: "中等偏高收入预期+晋升诱惑 → 接受996工作制", confidence: 90, level: "极高", evidence: "A级" },
      { content: "已婚育状态+高强度工作 → 亲子互动时间<2小时/日", confidence: 80, level: "高", evidence: "B级" },
      { content: "夫妻双方工作压力+未明确分工 → 家庭沟通时间<30分钟/日", confidence: 75, level: "高", evidence: "B级" },
      { content: "社交圈局限同事+行业竞争关系 → 深度倾诉对象≤1人", confidence: 85, level: "高", evidence: "B级" },
      { content: "工作区与卧室未隔离+家居布局杂乱 → 入睡潜伏期>45分钟", confidence: 80, level: "高", evidence: "B级" },
      { content: "居住密度>1.5人/㎡+噪音污染 → 睡眠中断次数≥3次/夜", confidence: 75, level: "高", evidence: "B级" },
      { content: "缺乏自然采光+通风不良 → 室内PM2.5浓度≥50μg/m³", confidence: 70, level: "中高", evidence: "C级" }
    ],
    institutional: [
      { content: "慢性病管理需求 → 医保政策匹配 → 医疗费用负担", confidence: 90, level: "极高", evidence: "A级" },
      { content: "企业健康管理缺失 → 员工健康意识不足 → 慢性病风险增加", confidence: 85, level: "高", evidence: "B级" },
      { content: "医疗资源分配不均 → 优质医疗资源集中 → 基层医疗服务能力不足", confidence: 95, level: "极高", evidence: "A级" },
      { content: "996工作制 → 长期超时工作 → 职业健康风险增加", confidence: 100, level: "极高", evidence: "政策事实" },
      { content: "年假制度执行不严 → 员工休息不足 → 疲劳累积", confidence: 90, level: "极高", evidence: "A级" },
      { content: "企业健康检查制度缺失 → 员工健康监测不足 → 健康问题发现滞后", confidence: 85, level: "高", evidence: "B级" },
      { content: "健康促进政策执行不力 → 健康行为改变困难 → 健康水平提升缓慢", confidence: 80, level: "高", evidence: "B级" },
      { content: "心理健康服务覆盖不足 → 心理问题识别率低 → 心理健康问题加重", confidence: 85, level: "高", evidence: "B级" },
      { content: "环境健康标准执行不严 → 环境污染影响健康 → 环境相关疾病增加", confidence: 75, level: "高", evidence: "B级" }
    ],
    lifecourse: [
      { content: "42岁中年期 → 代谢功能下降 → 慢性病风险增加", confidence: 95, level: "极高", evidence: "A级" },
      { content: "男性睾酮水平下降 → 肌肉量减少 → 基础代谢率下降", confidence: 90, level: "极高", evidence: "A级" },
      { content: "中年期认知功能开始下降 → 工作记忆能力减弱 → 工作效率下降", confidence: 85, level: "高", evidence: "B级" },
      { content: "男性健康意识相对较低 → 主动就医率低 → 疾病发现延迟", confidence: 90, level: "极高", evidence: "A级" },
      { content: "男性心血管疾病风险较高 → 需要重点关注血压、血脂", confidence: 95, level: "极高", evidence: "A级" },
      { content: "中年男性前列腺问题 → 需要定期前列腺检查", confidence: 85, level: "高", evidence: "B级" },
      { content: "已婚育状态 → 家庭健康管理责任 → 健康行为示范需求", confidence: 80, level: "高", evidence: "B级" },
      { content: "家庭经济责任重 → 工作压力大 → 健康管理时间不足", confidence: 85, level: "高", evidence: "B级" },
      { content: "子女教育投入大 → 时间精力分配 → 个人健康管理优先级下降", confidence: 80, level: "高", evidence: "B级" }
    ]
  };
  
  // 框架模块数据 - 基于Excel E列内容
  // 置信度评估函数
  const startConfidenceEvaluation = () => {
    setConfidenceEvaluating(true);
    setShowConfidencePanel(true);
    setConfidenceLogs([]);
    setCurrentLogIndex(0);
    
    const logs = [];
    
    // 生成评估日志
    logs.push("正在通过脚本请求大模型");
    logs.push("生成置信度评估内容");
    logs.push("实际业务中本过程将自动执行");
    logs.push("");
    logs.push("开始评估五维度健康需求...");
    logs.push("");
    
    // 评估所有维度
    const allDimensions = ['biomedical', 'psychological', 'social', 'institutional', 'lifecourse'];
    const allResults = {};
    
    allDimensions.forEach((dimension, dimIndex) => {
      const dimensionData = confidenceEvaluationData[dimension] || [];
      logs.push(`=== ${getDimensionName(dimension)}维度评估 ===`);
      logs.push("");
      
      dimensionData.forEach((item, index) => {
        logs.push(`[${dimIndex + 1}.${index + 1}] ${item.content}`);
        logs.push(`    推理链: ${item.content}`);
        logs.push(`    科学依据: 基于${item.evidence}证据级别研究`);
        logs.push(`    证据级别: ${item.evidence}`);
        logs.push(`    个体适用性: ${item.confidence}%`);
        logs.push(`    置信度: ${item.level}`);
        logs.push("");
      });
      
      // 保存该维度的结果
      const results = {};
      dimensionData.forEach((item, idx) => {
        results[`item_${idx}`] = {
          content: item.content,
          confidence: item.confidence,
          level: item.level,
          evidence: item.evidence
        };
      });
      allResults[dimension] = results;
    });
    
    logs.push("=== 综合评估结果 ===");
    logs.push("");
    
    // 统计各置信度等级的数量
    let totalFactors = 0;
    let highConfidenceCount = 0;
    let mediumConfidenceCount = 0;
    let lowConfidenceCount = 0;
    
    allDimensions.forEach(dimension => {
      const dimensionData = confidenceEvaluationData[dimension] || [];
      totalFactors += dimensionData.length;
      
      dimensionData.forEach(item => {
        if (item.confidence >= 80) {
          highConfidenceCount++;
        } else if (item.confidence >= 60) {
          mediumConfidenceCount++;
        } else {
          lowConfidenceCount++;
        }
      });
    });
    
    logs.push(`总计: ${totalFactors}个因素`);
    logs.push(`高置信度(≥80%): ${highConfidenceCount}个`);
    logs.push(`中等置信度(60-79%): ${mediumConfidenceCount}个`);
    logs.push(`低置信度(<60%): ${lowConfidenceCount}个`);
    logs.push("");
    logs.push("评估完成");
    
    setConfidenceLogs(logs);
    
    // 模拟逐行显示
    let index = 0;
    const interval = setInterval(() => {
      if (index < logs.length) {
        setCurrentLogIndex(index + 1);
        index++;
      } else {
        clearInterval(interval);
        setConfidenceEvaluating(false);
        // 更新所有维度的置信度结果
        setConfidenceResults(allResults);
      }
    }, 75); // 每75ms显示一行，速度提升一倍
  };
  
  const getDimensionName = (dimension) => {
    const names = {
      biomedical: '生物医学',
      psychological: '心理',
      social: '社会环境',
      institutional: '制度政策',
      lifecourse: '生命历程'
    };
    return names[dimension] || dimension;
  };
  
  const toggleConfidencePanel = () => {
    setShowConfidencePanel(!showConfidencePanel);
  };
  
  const getConfidenceColor = (level) => {
    switch (level) {
      case '极高': return '#ff4d4f';
      case '高': return '#fa8c16';
      case '中高': return '#faad14';
      case '中等': return '#52c41a';
      case '低': return '#1890ff';
      default: return '#d9d9d9';
    }
  };

  // 获取置信度标记组件
  const getConfidenceBadge = (dimension, itemIndex) => {
    const dimensionResults = confidenceResults[dimension];
    if (!dimensionResults || !dimensionResults[`item_${itemIndex}`]) {
      return null;
    }
    
    const item = dimensionResults[`item_${itemIndex}`];
    return (
      <Tag 
        color={getConfidenceColor(item.level)} 
        style={{ 
          marginLeft: 8, 
          fontSize: '10px',
          fontWeight: 'bold',
          borderRadius: '4px'
        }}
      >
        {item.confidence}% {item.level}
      </Tag>
    );
  };

  // 获取置信度边框样式
  const getConfidenceBorderStyle = (dimension, itemIndex) => {
    const dimensionResults = confidenceResults[dimension];
    if (!dimensionResults || !dimensionResults[`item_${itemIndex}`]) {
      return {};
    }
    
    const item = dimensionResults[`item_${itemIndex}`];
    return {
      border: `2px solid ${getConfidenceColor(item.level)}`,
      borderRadius: '6px',
      backgroundColor: `${getConfidenceColor(item.level)}10`
    };
  };
  
  const [frameworkModules, setFrameworkModules] = useState([
    {
      id: 1,
      name: "C1 睡眠-交感型疲劳系统",
      description: "涉及睡眠紊乱、压力引发的交感激活、生理恢复障碍等问题，常表现为疲劳、浅睡、早醒、白天无精打采等",
      category: "生理健康",
      priority: 1,
      status: "active",
      confidence: 95,
      indicators: [
        { 
          name: "心率变异性HRV", 
          target: ">30ms", 
          current: "待获取", 
          unit: "ms", 
          sources: [
            "需求评估：工作压力大→HPA轴激活→皮质醇持续分泌↑",
            "需求评估：疲劳感增加→交感神经持续兴奋→心率↑、血压↑",
            "需求评估：长期压力→偏头痛或紧张性头痛发作频率↑"
          ]
        },
        { 
          name: "皮质醇节律", 
          target: "正常节律", 
          current: "待获取", 
          unit: "状态", 
          sources: [
            "需求评估：工作压力大→HPA轴激活→皮质醇持续分泌↑→抑制褪黑素合成",
            "需求评估：睡眠质量下降+工作压力→睡眠障碍风险增加",
            "需求评估：长期压力+睡眠质量下降→免疫功能抑制（T细胞活性↓）"
          ]
        },
        { 
          name: "ASCVD风险评分", 
          target: "<5%", 
          current: "待获取", 
          unit: "%", 
          sources: [
            "需求评估：疲劳感增加→交感神经持续兴奋→心血管系统负荷加重",
            "需求评估：超重+工作压力→血压监测（收缩压/舒张压可能≥130/80 mmHg）",
            "需求评估：长期久坐→血脂异常（LDL-C↑、HDL-C↓）→动脉粥样硬化风险评估"
          ]
        },
        { 
          name: "睡眠质量评分", 
          target: ">7分", 
          current: "待获取", 
          unit: "分", 
          sources: [
            "需求评估：睡眠质量下降+工作压力→睡眠障碍风险增加",
            "需求评估：睡眠障碍→生物钟紊乱→双向情感障碍早期症状排查",
            "需求评估：睡眠质量下降→多导睡眠图（PSG）检查→排除阻塞性睡眠呼吸暂停低通气综合征"
          ]
        }
      ],
      requirements: [
        "睡眠环境优化",
        "压力管理技巧",
        "生物钟调节",
        "疲劳恢复策略"
      ],
      interventions: [
        "睡眠卫生教育",
        "放松训练",
        "认知行为疗法",
        "环境改善建议"
      ],
      treeStructure: {
        title: "C1 睡眠-交感型疲劳系统",
        key: "sleep_fatigue",
        children: [
          {
            title: "睡眠优化",
            key: "sleep_opt",
            children: [
              { title: "睡眠环境", key: "environment", isLeaf: true },
              { title: "睡眠习惯", key: "habits", isLeaf: true },
              { title: "睡前准备", key: "preparation", isLeaf: true }
            ]
          },
          {
            title: "压力管理",
            key: "stress",
            children: [
              { title: "放松技巧", key: "relaxation", isLeaf: true },
              { title: "认知重构", key: "cognition", isLeaf: true },
              { title: "时间管理", key: "time_mgmt", isLeaf: true }
            ]
          }
        ]
      },
      flowchartData: {
        title: "C1 睡眠-交感型疲劳系统流程图",
        mermaid: `graph TD
          A[睡眠问题评估] --> B{睡眠质量评分}
          B -->|>7分| C[睡眠良好]
          B -->|5-7分| D[轻度睡眠障碍]
          B -->|<5分| E[重度睡眠障碍]
          
          D --> F[睡眠环境优化]
          E --> G[综合干预方案]
          
          F --> H[睡眠卫生教育]
          F --> I[环境改善建议]
          
          G --> J[认知行为疗法]
          G --> K[放松训练]
          G --> L[生物钟调节]
          
          H --> M[效果评估]
          I --> M
          J --> M
          K --> M
          L --> M
          
          M --> N{改善程度}
          N -->|显著改善| O[维持方案]
          N -->|部分改善| P[调整干预]
          N -->|无改善| Q[重新评估]
          
          O --> R[长期监测]
          P --> M
          Q --> A
          
          classDef startNode fill:#e1f5fe
          classDef processNode fill:#f3e5f5
          classDef decisionNode fill:#fff3e0
          classDef endNode fill:#e8f5e8
          
          class A startNode
          class B,N decisionNode
          class C,O,R endNode
          class D,E,F,G,H,I,J,K,L,M,P,Q processNode`
      }
    },
    {
      id: 2,
      name: "C2 代谢风险预警系统",
      description: "关注因BMI超标、久坐、激素紊乱等引起的胰岛素抵抗、脂肪肝、糖尿病前期等代谢异常趋势",
      category: "生理健康",
      priority: 2,
      status: "active",
      confidence: 92,
      indicators: [
        { 
          name: "空腹血糖", 
          target: "<6.1 mmol/L", 
          current: "待获取", 
          unit: "mmol/L", 
          sources: [
            "需求评估：疲劳+睡眠障碍→血糖检测（空腹血糖≥6.1 mmol/L）→糖调节受损",
            "需求评估：超重（BMI 25.9）→腹腔脂肪堆积→胰岛素抵抗风险↑",
            "需求评估：睡眠剥夺→下丘脑食欲调节因子失衡（瘦素↓、饥饿素↑）→能量代谢紊乱"
          ]
        },
        { 
          name: "餐后2小时血糖", 
          target: "<7.8 mmol/L", 
          current: "待获取", 
          unit: "mmol/L", 
          sources: [
            "需求评估：超重→脂肪细胞因子分泌异常（如瘦素抵抗）→诱发胰岛素抵抗",
            "需求评估：长期久坐→血脂异常（LDL-C↑、HDL-C↓）→动脉粥样硬化风险评估",
            "需求评估：久坐IT职业→腰椎MRI检查（L4-L5椎间盘突出可能）→骨科干预"
          ]
        },
        { 
          name: "胰岛素", 
          target: "5-25 μU/mL", 
          current: "待获取", 
          unit: "μU/mL", 
          sources: [
            "需求评估：长期久坐→血脂异常（LDL-C↑、HDL-C↓）→动脉粥样硬化风险评估",
            "需求评估：超重→脂肪细胞因子分泌异常（如瘦素抵抗）→诱发胰岛素抵抗",
            "需求评估：疲劳+睡眠障碍→血糖检测（空腹血糖≥6.1 mmol/L）→糖调节受损"
          ]
        },
        { 
          name: "HbA1c", 
          target: "<5.7%", 
          current: "待获取", 
          unit: "%", 
          sources: [
            "需求评估：超重→脂肪细胞因子分泌异常（如瘦素抵抗）→诱发胰岛素抵抗",
            "需求评估：超重（BMI 25.9）→腹腔脂肪堆积→胰岛素抵抗风险↑",
            "需求评估：长期久坐→血脂异常（LDL-C↑、HDL-C↓）→动脉粥样硬化风险评估"
          ]
        }
      ],
      requirements: [
        "血糖监测与饮食调整",
        "体重管理与运动指导",
        "胰岛素敏感性改善",
        "代谢综合征预防"
      ],
      interventions: [
        "个性化饮食方案",
        "有氧运动计划",
        "血糖监测指导",
        "营养补充建议"
      ],
      treeStructure: {
        title: "C2 代谢风险预警系统",
        key: "metabolism",
        children: [
          {
            title: "血糖管理",
            key: "glucose",
            children: [
              { title: "饮食调整", key: "diet", isLeaf: true },
              { title: "血糖监测", key: "monitoring", isLeaf: true },
              { title: "药物管理", key: "medication", isLeaf: true }
            ]
          },
          {
            title: "体重管理",
            key: "weight",
            children: [
              { title: "运动计划", key: "exercise", isLeaf: true },
              { title: "营养指导", key: "nutrition", isLeaf: true },
              { title: "行为改变", key: "behavior", isLeaf: true }
            ]
          }
        ]
      },
      flowchartData: {
        title: "C2 代谢风险预警系统流程图",
        mermaid: `graph TD
          A[代谢风险评估] --> B{血糖水平检测}
          B -->|正常| C[维持现状]
          B -->|偏高| D[糖尿病前期]
          B -->|异常| E[糖尿病风险]
          
          D --> F[饮食干预]
          E --> G[综合管理方案]
          
          F --> H[个性化饮食方案]
          F --> I[血糖监测指导]
          
          G --> J[药物治疗]
          G --> K[生活方式干预]
          G --> L[定期监测]
          
          H --> M[效果评估]
          I --> M
          J --> M
          K --> M
          L --> M
          
          M --> N{改善情况}
          N -->|血糖正常| O[维持管理]
          N -->|部分改善| P[调整方案]
          N -->|无改善| Q[强化干预]
          
          O --> R[长期监测]
          P --> M
          Q --> S[医疗咨询]
          S --> M
          
          classDef startNode fill:#e1f5fe
          classDef processNode fill:#f3e5f5
          classDef decisionNode fill:#fff3e0
          classDef endNode fill:#e8f5e8
          classDef warningNode fill:#ffebee
          
          class A startNode
          class B,N decisionNode
          class C,O,R endNode
          class D,E,F,G,H,I,J,K,L,M,P,Q,S processNode
          class E warningNode`
      }
    },
    {
      id: 3,
      name: "C3 结构性阻力-行动中断系统",
      description: "聚焦工作时间、资源分布、服务可达性等导致的健康行为中断问题",
      category: "社会健康",
      priority: 3,
      status: "active",
      confidence: 88,
      indicators: [
        { 
          name: "客户日程图谱", 
          target: "空闲时间>2h", 
          current: "待获取", 
          unit: "小时", 
          sources: [
            "需求评估：IT工作996+疲劳症状→工作压力过大→时间管理困难",
            "需求评估：久坐IT职业→腰椎MRI检查（L4-L5椎间盘突出可能）→骨科干预",
            "需求评估：工作强度高，久坐办公→健康行为中断"
          ]
        },
        { 
          name: "门诊到达率", 
          target: ">80%", 
          current: "待获取", 
          unit: "%", 
          sources: [
            "需求评估：久坐IT职业→腰椎MRI检查（L4-L5椎间盘突出可能）→骨科干预",
            "需求评估：工作强度高，久坐办公→健康行为中断",
            "需求评估：经济承受能力评估→服务可达性分析"
          ]
        },
        { 
          name: "自我延迟行为评分", 
          target: "<3分", 
          current: "待获取", 
          unit: "分", 
          sources: [
            "需求评估：工作强度高，久坐办公→健康行为中断",
            "需求评估：IT工作996+疲劳症状→工作压力过大→时间管理困难",
            "需求评估：经济承受能力评估→服务可达性分析"
          ]
        },
        { 
          name: "常规体检完成率", 
          target: ">80%", 
          current: "待获取", 
          unit: "%", 
          sources: [
            "需求评估：经济承受能力评估→服务可达性分析",
            "需求评估：健康话题职场禁忌+情绪压抑→心理健康咨询利用率<5%",
            "需求评估：IT工作996+疲劳症状→工作压力过大→时间管理困难"
          ]
        }
      ],
      requirements: [
        "时间管理优化",
        "服务可达性提升",
        "资源分布调整",
        "行为障碍消除"
      ],
      interventions: [
        "灵活预约系统",
        "远程健康服务",
        "时间管理培训",
        "资源整合方案"
      ],
      treeStructure: {
        title: "C3 结构性阻力-行动中断系统",
        key: "structural_barriers",
        children: [
          {
            title: "时间管理",
            key: "time_mgmt",
            children: [
              { title: "日程优化", key: "schedule", isLeaf: true },
              { title: "优先级排序", key: "priority", isLeaf: true },
              { title: "时间分配", key: "allocation", isLeaf: true }
            ]
          },
          {
            title: "服务可达性",
            key: "accessibility",
            children: [
              { title: "远程服务", key: "remote", isLeaf: true },
              { title: "预约系统", key: "booking", isLeaf: true },
              { title: "资源整合", key: "integration", isLeaf: true }
            ]
          }
        ]
      },
      flowchartData: {
        title: "C3 结构性阻力-行动中断系统流程图",
        mermaid: `graph TD
          A[结构性阻力评估] --> B{时间可用性分析}
          B -->|充足| C[正常服务]
          B -->|不足| D[时间管理干预]
          B -->|严重不足| E[服务模式调整]
          
          D --> F[日程优化]
          E --> G[灵活服务方案]
          
          F --> H[优先级排序]
          F --> I[时间分配策略]
          
          G --> J[远程健康服务]
          G --> K[灵活预约系统]
          G --> L[资源整合方案]
          
          H --> M[效果评估]
          I --> M
          J --> M
          K --> M
          L --> M
          
          M --> N{服务完成率}
          N -->|>80%| O[维持方案]
          N -->|60-80%| P[优化调整]
          N -->|<60%| Q[重新设计]
          
          O --> R[持续监测]
          P --> M
          Q --> S[深度分析]
          S --> M
          
          classDef startNode fill:#e1f5fe
          classDef processNode fill:#f3e5f5
          classDef decisionNode fill:#fff3e0
          classDef endNode fill:#e8f5e8
          classDef warningNode fill:#ffebee
          
          class A startNode
          class B,N decisionNode
          class C,O,R endNode
          class D,E,F,G,H,I,J,K,L,M,P,Q,S processNode
          class E warningNode`
      }
    },
    {
      id: 4,
      name: "C4 健康观念-认知误区系统",
      description: "关注客户因非理性信念、健康羞耻感、对健康的误解等认知偏差导致的健康管理障碍",
      category: "心理健康",
      priority: 4,
      status: "active",
      confidence: 85,
      indicators: [
        { 
          name: "非理性信念自评", 
          target: "<3分", 
          current: "待获取", 
          unit: "分", 
          sources: [
            "需求评估：压力认知评估→非理性信念（如'必须完美完成工作'）→认知行为疗法（CBT）修正",
            "需求评估：健康话题职场禁忌+情绪压抑→心理健康咨询利用率<5%",
            "需求评估：重度焦虑症检出率高出社会均值40%"
          ]
        },
        { 
          name: "认知行为疗法反应", 
          target: "良好", 
          current: "待获取", 
          unit: "状态", 
          sources: [
            "需求评估：健康话题职场禁忌+情绪压抑→心理健康咨询利用率<5%",
            "需求评估：压力认知评估→非理性信念（如'必须完美完成工作'）→认知行为疗法（CBT）修正",
            "需求评估：重度焦虑症检出率高出社会均值40%"
          ]
        },
        { 
          name: "健康羞耻感评分", 
          target: "<2分", 
          current: "待获取", 
          unit: "分", 
          sources: [
            "需求评估：重度焦虑症检出率高出社会均值40%",
            "需求评估：健康话题职场禁忌+情绪压抑→心理健康咨询利用率<5%",
            "需求评估：压力认知评估→非理性信念（如'必须完美完成工作'）→认知行为疗法（CBT）修正"
          ]
        },
        { 
          name: "健康知识准确率", 
          target: ">80%", 
          current: "待获取", 
          unit: "%", 
          sources: [
            "需求评估：健康知识正确率评估→健康行为依从性分析",
            "需求评估：工作强度高，久坐办公→健康行为中断",
            "需求评估：IT工作996+疲劳症状→工作压力过大→时间管理困难"
          ]
        }
      ],
      requirements: [
        "认知重构训练",
        "健康知识教育",
        "羞耻感消除",
        "理性信念建立"
      ],
      interventions: [
        "认知行为疗法",
        "健康知识培训",
        "心理支持服务",
        "信念修正指导"
      ],
      treeStructure: {
        title: "C4 健康观念-认知误区系统",
        key: "cognitive_bias",
        children: [
          {
            title: "认知重构",
            key: "cognitive_restructure",
            children: [
              { title: "信念识别", key: "belief_identification", isLeaf: true },
              { title: "理性分析", key: "rational_analysis", isLeaf: true },
              { title: "信念修正", key: "belief_modification", isLeaf: true }
            ]
          },
          {
            title: "健康教育",
            key: "health_education",
            children: [
              { title: "知识培训", key: "knowledge_training", isLeaf: true },
              { title: "误区纠正", key: "misconception_correction", isLeaf: true },
              { title: "实践指导", key: "practice_guidance", isLeaf: true }
            ]
          }
        ]
      },
      flowchartData: {
        title: "C4 健康观念-认知误区系统流程图",
        mermaid: `graph TD
          A[认知误区评估] --> B{非理性信念识别}
          B -->|轻度| C[健康教育]
          B -->|中度| D[认知重构训练]
          B -->|重度| E[深度心理干预]
          
          C --> F[健康知识培训]
          D --> G[认知行为疗法]
          E --> H[综合心理治疗]
          
          F --> I[误区纠正]
          G --> J[信念修正]
          H --> K[心理支持服务]
          
          I --> L[效果评估]
          J --> L
          K --> L
          
          L --> M{认知改善程度}
          M -->|显著改善| N[维持方案]
          M -->|部分改善| O[强化训练]
          M -->|无改善| P[重新评估]
          
          N --> Q[持续监测]
          O --> L
          P --> R[专业咨询]
          R --> L
          
          classDef startNode fill:#e1f5fe
          classDef processNode fill:#f3e5f5
          classDef decisionNode fill:#fff3e0
          classDef endNode fill:#e8f5e8
          classDef warningNode fill:#ffebee
          
          class A startNode
          class B,M decisionNode
          class C,D,E,N,Q endNode
          class F,G,H,I,J,K,L,O,P,R processNode
          class E warningNode`
      }
    },
    {
      id: 5,
      name: "C5 情绪-心理健康系统",
      description: "关注客户因情绪压抑、焦虑、抑郁等心理问题带来的健康风险",
      category: "心理健康",
      priority: 5,
      status: "active",
      confidence: 90,
      indicators: [
        { 
          name: "情绪健康指数", 
          target: ">7分", 
          current: "待获取", 
          unit: "分", 
          sources: [
            "需求评估：疲劳+工作压力→抑郁焦虑量表（PHQ-9/GAD-7）评估→可能存在轻度抑郁或焦虑障碍",
            "需求评估：睡眠障碍→生物钟紊乱→双向情感障碍早期症状排查",
            "需求评估：健康话题职场禁忌+情绪压抑→心理健康咨询利用率<5%"
          ]
        },
        { 
          name: "社交支持度自评", 
          target: ">6分", 
          current: "待获取", 
          unit: "分", 
          sources: [
            "需求评估：睡眠障碍→生物钟紊乱→双向情感障碍早期症状排查",
            "需求评估：健康话题职场禁忌+情绪压抑→心理健康咨询利用率<5%",
            "需求评估：重度焦虑症检出率高出社会均值40%"
          ]
        },
        { 
          name: "抑郁情绪发生率", 
          target: "<10%", 
          current: "待获取", 
          unit: "%", 
          sources: [
            "需求评估：健康话题职场禁忌+情绪压抑→心理健康咨询利用率<5%",
            "需求评估：疲劳+工作压力→抑郁焦虑量表（PHQ-9/GAD-7）评估→可能存在轻度抑郁或焦虑障碍",
            "需求评估：重度焦虑症检出率高出社会均值40%"
          ]
        },
        { 
          name: "深度倾诉对象", 
          target: "≥2人", 
          current: "待获取", 
          unit: "人", 
          sources: [
            "需求评估：重度焦虑症检出率高出社会均值40%",
            "需求评估：健康话题职场禁忌+情绪压抑→心理健康咨询利用率<5%",
            "需求评估：睡眠障碍→生物钟紊乱→双向情感障碍早期症状排查"
          ]
        }
      ],
      requirements: [
        "情绪管理技能",
        "社交支持网络",
        "心理压力缓解",
        "情感表达训练"
      ],
      interventions: [
        "情绪管理培训",
        "社交技能训练",
        "心理咨询服务",
        "支持小组活动"
      ],
      treeStructure: {
        title: "C5 情绪-心理健康系统",
        key: "emotional_mental",
        children: [
          {
            title: "情绪管理",
            key: "emotion_mgmt",
            children: [
              { title: "情绪识别", key: "emotion_recognition", isLeaf: true },
              { title: "情绪调节", key: "emotion_regulation", isLeaf: true },
              { title: "压力缓解", key: "stress_relief", isLeaf: true }
            ]
          },
          {
            title: "社交支持",
            key: "social_support",
            children: [
              { title: "社交技能", key: "social_skills", isLeaf: true },
              { title: "支持网络", key: "support_network", isLeaf: true },
              { title: "沟通训练", key: "communication", isLeaf: true }
            ]
          }
        ]
      },
      flowchartData: {
        title: "C5 情绪-心理健康系统流程图",
        mermaid: `graph TD
          A[情绪健康评估] --> B{情绪状态分析}
          B -->|健康| C[维持现状]
          B -->|轻度问题| D[情绪管理训练]
          B -->|严重问题| E[专业心理干预]
          
          D --> F[情绪识别训练]
          E --> G[心理咨询服务]
          
          F --> H[情绪调节技巧]
          F --> I[压力缓解方法]
          
          G --> J[深度心理治疗]
          G --> K[药物治疗评估]
          G --> L[支持小组活动]
          
          H --> M[效果评估]
          I --> M
          J --> M
          K --> M
          L --> M
          
          M --> N{情绪改善情况}
          N -->|显著改善| O[维持管理]
          N -->|部分改善| P[强化干预]
          N -->|无改善| Q[重新评估]
          
          O --> R[长期监测]
          P --> M
          Q --> S[专业转介]
          S --> M
          
          classDef startNode fill:#e1f5fe
          classDef processNode fill:#f3e5f5
          classDef decisionNode fill:#fff3e0
          classDef endNode fill:#e8f5e8
          classDef warningNode fill:#ffebee
          
          class A startNode
          class B,N decisionNode
          class C,O,R endNode
          class D,E,F,G,H,I,J,K,L,M,P,Q,S processNode
          class E warningNode`
      }
    }
  ]);
  
  // 多模态数据采集状态
  const [activeDataSource, setActiveDataSource] = useState('files');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [apiConnections, setApiConnections] = useState([]);
  const [manualData, setManualData] = useState({});
  const [dataCollectionProgress, setDataCollectionProgress] = useState(0);
  
  // 增加数据特殊流程状态
  const [isAddDataMode, setIsAddDataMode] = useState(false);
  const [memberInfo, setMemberInfo] = useState(null);
  const [showMemberInfoModal, setShowMemberInfoModal] = useState(false);
  const [pendingUpdateData, setPendingUpdateData] = useState(null);


  // 六个阶段的菜单配置
  const stageMenus = [
    {
      key: 'stage1',
      icon: <AudioOutlined />,
      title: '数据采集'
    },
    {
      key: 'stage2',
      icon: <SearchOutlined />,
      title: '需求评估'
    },
    {
      key: 'stage3',
      icon: <AppstoreOutlined />,
      title: '框架构建'
    },
    {
      key: 'stage4',
      icon: <NodeIndexOutlined />,
      title: '个性化方案'
    }
    // 暂时隐藏以下两个菜单项
    // {
    //   key: 'stage5',
    //   icon: <SyncOutlined />,
    //   title: '动态调整'
    // },
    // {
    //   key: 'stage6',
    //   icon: <FileSearchOutlined />,
    //   title: '效果评估'
    // }
  ];

  // 模拟健康简历数据
  const mockHealthResume = {
    basicInfo: {
      name: "张伟",
      age: 36,
      location: "北京",
      occupation: "IT公司项目经理",
      avatar: "👨‍💼"
    },
    overview: {
      physical: "体重75kg，BMI24.5，血压125/80 mmHg；长期保持规律运动和均衡饮食，作息稳定；腰椎间盘突出史，儿童期哮喘已控制。",
      psychological: "偶尔焦虑，压力评分7/10；通过CBT心理咨询、冥想及规律运动缓解压力。",
      lifestyle: "固定作息22:45-7:00，每周跑步3次，周末骑行/羽毛球，高蛋白低碳水饮食，夜间电子设备受控；热衷科技、阅读和公益活动。",
      social: "配偶共同运动和监督饮食，父母健康状况关注中；朋友社群活跃，线上心理辅导平台参与中。",
      majorEvents: ["2015腰椎突出", "2018血糖偏高", "2020健康管理计划", "2023轻度失眠"],
      goals: "短期维持体重75kg、睡眠7.5h/晚、心理压力中等以下；长期体脂&lt;20%，运动与心理习惯常态化"
    },
    themes: {
      physical: {
        title: "身体健康",
        overview: "体重、血压、血糖、血脂指标稳定，腰椎和哮喘历史需关注。主动管理策略：运动、饮食、定期体检。",
        timeline: [
          { year: "2000-2005", event: "儿童期哮喘", details: "冬季偶发，吸入药物控制，无长期影响", type: "medical" },
          { year: "2015", event: "腰椎间盘突出", details: "久坐导致，物理治疗+核心训练", type: "medical" },
          { year: "2018.06", event: "血糖偏高", details: "6.3 mmol/L，高强度工作、晚餐不规律；饮食调整+跑步3次/周", type: "medical" },
          { year: "2018.12", event: "血糖恢复", details: "5.4 mmol/L，工作稳定，保持运动饮食习惯", type: "improvement" },
          { year: "2020-2023", event: "体重管理", details: "从82kg降至75kg，BMI24-25；运动多样化（跑步/骑行/羽毛球）", type: "improvement" }
        ],
        interventions: ["核心训练", "跑步", "饮食调整", "定期体检"]
      },
      psychological: {
        title: "心理与压力",
        overview: "压力来源主要为工作和家庭教育，偶尔焦虑，主动干预有效",
        timeline: [
          { year: "2015-2018", event: "工作压力", details: "加班压力中高，缓解方式：运动、短途旅行", type: "stress" },
          { year: "2019-2021", event: "项目压力", details: "项目紧张、绩效压力高，冥想、社交活动、运动，压力评分7-8/10", type: "stress" },
          { year: "2022-2023", event: "综合压力", details: "家庭教育+工作压力中高，CBT心理咨询+户外活动，压力评分7/10", type: "stress" }
        ],
        interventions: ["CBT心理咨询", "冥想", "社交活动", "运动", "自我觉察习惯"]
      },
      lifestyle: {
        title: "生活方式与兴趣",
        overview: "作息规律，饮食健康，运动有计划，兴趣丰富",
        timeline: [
          { year: "2015-2017", event: "作息调整", details: "23:30-7:30，夜宵频繁，高碳水饮食，运动不规律", type: "lifestyle" },
          { year: "2018-2020", event: "饮食改善", details: "23:00-7:00，减少夜宵，增加蔬菜蛋白，每周跑步2-3次", type: "lifestyle" },
          { year: "2021-2023", event: "规律生活", details: "22:45-7:00，高蛋白低碳水饮食，夜间电子设备受控，每周跑步3次/30-40分钟，周末骑行或羽毛球", type: "lifestyle" }
        ],
        interests: ["科技", "阅读", "公益", "每月至少参与1次"]
      },
      social: {
        title: "家庭与社交",
        overview: "配偶监督健康，父母健康关注，朋友社群活跃",
        timeline: [
          { year: "2015-2020", event: "家庭支持", details: "与配偶共同运动，周末家庭活动", type: "social" },
          { year: "2020-2023", event: "社群参与", details: "线上心理辅导平台参与，社交网络活跃", type: "social" }
        ],
        support: ["家庭监督", "社区社群", "心理辅导平台"]
      }
    }
  };

  const steps = [
    {
      title: '多模态数据解析',
      description: '智能解析音频、视频、文档等多种格式的健康数据',
      icon: <UploadOutlined />
    },
    {
      title: 'AI解析',
      description: '生成健康简历',
      icon: <FileTextOutlined />
    },
    {
      title: '查看简历',
      description: '浏览多维健康信息',
      icon: <UserOutlined />
    },
    {
      title: '持续更新',
      description: '交互式丰富内容',
      icon: <EditOutlined />
    }
  ];

  // 文件上传处理
  const handleFileUpload = (file) => {
    const newFile = {
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploaded',
      uploadTime: new Date().toLocaleString()
    };
    setUploadedFiles(prev => [...prev, newFile]);
    updateDataCollectionProgress();
    
    // 检查是否为"增加数据"文件
    if (file.name.includes('增加数据')) {
      setIsAddDataMode(true);
      message.info('检测到"增加数据"文件，将进入会员信息查询流程');
    } else {
      message.success(`${file.name} 上传成功！`);
    }
    
    return false; // 阻止默认上传行为
  };

  // 开始数据分析
  const startDataAnalysis = async () => {
    setUploading(true);
    setCurrentStep(1);
    
    // 模拟多模态数据分析过程
    for (let i = 0; i <= 100; i += 10) {
      setAnalysisProgress(i);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // 设置AI解析结果 - 模拟真实的医患对话
    const mockAnalysisResult = `医生您好，我是张先生，今年35岁，在一家互联网公司做产品经理。最近几个月感觉身体状态不太好，想咨询一下。主要是睡眠问题比较严重，每天晚上躺在床上要一两个小时才能睡着，而且经常半夜醒来，早上起床的时候感觉特别累，白天工作的时候注意力也不集中。我觉得可能是因为工作压力比较大，最近项目比较紧，经常要加班到很晚，有时候回到家都11点多了，洗漱完躺在床上脑子里还在想工作的事情。饮食方面也不太规律，经常因为加班就随便点个外卖，有时候晚上9点多才吃晚饭，而且口味比较重，喜欢吃辣的。运动方面确实很少，基本上就是公司和家里两点一线，周末有时候想出去走走但是又觉得累，就在家里躺着。最近还经常感到焦虑，特别是想到工作上的事情就紧张，有时候还会胸闷。我知道这样下去对身体不好，但是不知道怎么改变，想听听您的建议。另外我父母都有高血压，我有点担心会不会遗传。`;

    setAnalysisResult(mockAnalysisResult);
    
    // 模拟计算识别准确率 (85-98%之间)
    const accuracy = Math.floor(Math.random() * 14) + 85; // 85-98
    setRecognitionAccuracy(accuracy);
    
    setAnalysisCompleted(true);
    setUploading(false);
    message.success(`AI解析完成！识别准确率: ${accuracy}%`);
  };

  // 模拟会员信息查询
  const simulateMemberInfoQuery = async () => {
    // 模拟查询到的会员信息
    const mockMemberInfo = {
      id: 'M001',
      name: '张伟',
      age: 36,
      location: '北京',
      occupation: 'IT公司项目经理',
      phone: '138****8888',
      email: 'zhangwei@example.com',
      memberSince: '2020-03-15',
      lastUpdate: '2024-01-15',
      healthStatus: '良好',
      riskLevel: '低风险',
      currentGoals: ['维持体重', '改善睡眠', '降低压力'],
      recentEvents: ['2023年轻度失眠', '2024年体检正常']
    };
    
    setMemberInfo(mockMemberInfo);
    setShowMemberInfoModal(true);
    message.info('检测到"增加数据"文件，已查询到会员信息');
  };

  // 预定义的医患对话数据
  const mockDialogueData = [
    { speaker: '患者', content: '医生您好，我是张先生，今年35岁，在一家互联网公司做产品经理。最近几个月感觉身体状态不太好，想咨询一下。', isDoctor: false },
    { speaker: '患者', content: '主要是睡眠问题比较严重，每天晚上躺在床上要一两个小时才能睡着，而且经常半夜醒来，早上起床的时候感觉特别累，白天工作的时候注意力也不集中。', isDoctor: false },
    { speaker: '医生', content: '这种情况持续多长时间了？您平时几点上床睡觉？', isDoctor: true },
    { speaker: '患者', content: '大概有三个月了。我一般晚上11点多才上床，但是躺下后要很久才能睡着，有时候到凌晨1点多才睡着。早上7点就要起床，感觉睡眠时间不够。', isDoctor: false },
    { speaker: '医生', content: '您觉得是什么原因导致的失眠呢？工作压力大吗？', isDoctor: true },
    { speaker: '患者', content: '我觉得可能是因为工作压力比较大，最近项目比较紧，经常要加班到很晚，有时候回到家都11点多了，洗漱完躺在床上脑子里还在想工作的事情，越想越睡不着。', isDoctor: false },
    { speaker: '医生', content: '除了睡眠问题，还有其他身体不适吗？', isDoctor: true },
    { speaker: '患者', content: '饮食方面也不太规律，经常因为加班就随便点个外卖，有时候晚上9点多才吃晚饭，而且口味比较重，喜欢吃辣的。运动方面确实很少，基本上就是公司和家里两点一线，周末有时候想出去走走但是又觉得累，就在家里躺着。', isDoctor: false },
    { speaker: '医生', content: '您刚才提到工作压力，具体是什么样的压力呢？', isDoctor: true },
    { speaker: '患者', content: '最近还经常感到焦虑，特别是想到工作上的事情就紧张，有时候还会胸闷。我知道这样下去对身体不好，但是不知道怎么改变，想听听您的建议。', isDoctor: false },
    { speaker: '医生', content: '您家里有高血压病史吗？', isDoctor: true },
    { speaker: '患者', content: '我父母都有高血压，我有点担心会不会遗传。而且我最近体检发现血压有点偏高，130/85，虽然还没到高血压的标准，但是比正常值高一些。', isDoctor: false },
    { speaker: '医生', content: '您平时有抽烟喝酒的习惯吗？', isDoctor: true },
    { speaker: '患者', content: '我不抽烟，但是偶尔会喝点酒，主要是应酬的时候，大概一周一两次吧，每次喝得不多。', isDoctor: false },
    { speaker: '医生', content: '您的工作性质是久坐吗？一天大概坐多长时间？', isDoctor: true },
    { speaker: '患者', content: '是的，我主要是做产品经理，大部分时间都是坐在电脑前，一天大概坐8-10个小时，除了上厕所和吃饭基本不动。', isDoctor: false },
    { speaker: '医生', content: '您刚才说周末想运动但是觉得累，这种疲劳感是身体上的还是心理上的？', isDoctor: true },
    { speaker: '患者', content: '主要是身体上的，感觉整个人没精神，做什么都提不起劲。心理上也有点焦虑，担心工作做不好，担心身体出问题。', isDoctor: false },
    { speaker: '医生', content: '您有尝试过什么方法来改善睡眠吗？', isDoctor: true },
    { speaker: '患者', content: '试过一些，比如睡前喝牛奶，听轻音乐，但是效果都不太好。有时候实在睡不着就玩手机，结果越玩越精神。', isDoctor: false },
    { speaker: '医生', content: '您平时的工作时间是怎样的？有固定的作息时间吗？', isDoctor: true },
    { speaker: '患者', content: '工作时间比较不固定，有时候早上9点上班，有时候10点，下班时间更不固定，经常要加班到晚上8、9点，有时候甚至更晚。周末有时候也要处理工作上的事情。', isDoctor: false },
    { speaker: '医生', content: '您觉得这种工作状态可以改变吗？比如和领导沟通一下工作量？', isDoctor: true },
    { speaker: '患者', content: '这个比较困难，我们这个行业竞争很激烈，项目进度要求很紧，大家都在加班，我也不好意思提出来。而且现在经济形势不好，工作也不好找，不敢轻易换工作。', isDoctor: false },
    { speaker: '医生', content: '您刚才提到胸闷，这种症状是什么时候出现的？持续多长时间？', isDoctor: true },
    { speaker: '患者', content: '大概两个月前开始的，主要是工作压力大的时候，或者晚上失眠的时候会感觉胸闷，有时候还会心慌，但是休息一下会好一些。', isDoctor: false },
    { speaker: '医生', content: '您最近有做过什么检查吗？除了血压偏高，还有其他异常指标吗？', isDoctor: true },
    { speaker: '患者', content: '上个月做了体检，除了血压偏高，还有血脂稍微高一点，胆固醇5.8，医生说要注意饮食和运动。其他指标基本正常。', isDoctor: false },
    { speaker: '医生', content: '您平时有头痛、头晕的症状吗？', isDoctor: true },
    { speaker: '患者', content: '偶尔会有，特别是睡眠不好的时候，早上起床会感觉头晕，有时候还会头痛，但是不是很严重，休息一下会好一些。', isDoctor: false },
    { speaker: '医生', content: '您觉得是什么原因让您决定来看医生的？', isDoctor: true },
    { speaker: '患者', content: '主要是担心这样下去身体会出大问题，而且最近感觉工作效率也下降了，注意力不集中，容易出错，这样下去对工作也不好。我想听听您的建议，看看怎么改善这种情况。', isDoctor: false }
  ];

  // 解析对话内容 - 简化版本，直接返回预定义的对话
  const parseDialogue = (text) => {
    return mockDialogueData;
  };

  // 确认AI解析结果，进入简历查看步骤
  const confirmAnalysisResult = () => {
    setHealthResume(mockHealthResume);
    setCurrentStep(2);
    
    // 如果是增加数据模式，在进入查看简历页面后显示会员信息查询
    if (isAddDataMode) {
      setTimeout(() => {
        simulateMemberInfoQuery();
      }, 500); // 延迟500ms显示，让页面先渲染
    } else {
      message.success('已确认解析结果，正在生成健康简历...');
    }
  };

  // 处理更新健康简历
  const handleUpdateHealthResume = () => {
    if (!memberInfo) return;
    
    // 模拟新的健康数据
    const newHealthData = {
      physicalHealth: {
        weight: '76kg',
        bmi: '24.8',
        bloodPressure: '128/82 mmHg',
        newSymptoms: '最近偶尔头痛，可能与工作压力有关'
      },
      mentalState: {
        stressLevel: '8/10',
        newConcerns: '工作压力增加，睡眠质量下降',
        copingMethods: '开始尝试冥想和深呼吸练习'
      },
      lifestyle: {
        exerciseFrequency: '每周2-3次',
        dietChanges: '减少外卖，增加蔬菜摄入',
        sleepPattern: '22:30-7:00，但质量不佳'
      },
      recentEvents: ['2024年1月工作压力增加', '2024年1月开始头痛症状']
    };
    
    // 合并到现有健康简历中
    const updatedResume = {
      ...mockHealthResume,
      basicInfo: {
        ...mockHealthResume.basicInfo,
        name: memberInfo.name,
        age: memberInfo.age,
        location: memberInfo.location,
        occupation: memberInfo.occupation
      },
      physicalHealth: {
        ...mockHealthResume.physicalHealth,
        ...newHealthData.physicalHealth
      },
      mentalState: {
        ...mockHealthResume.mentalState,
        ...newHealthData.mentalState
      },
      lifestyle: {
        ...mockHealthResume.lifestyle,
        ...newHealthData.lifestyle
      },
      overview: {
        ...mockHealthResume.overview,
        majorEvents: [
          ...mockHealthResume.overview.majorEvents,
          ...newHealthData.recentEvents
        ]
      }
    };
    
    setHealthResume(updatedResume);
    setShowMemberInfoModal(false);
    setCurrentStep(2);
    setIsAddDataMode(false);
    message.success('健康简历已更新！新数据已合并到现有简历中。');
  };

  // 处理取消更新
  const handleCancelUpdate = () => {
    setShowMemberInfoModal(false);
    setIsAddDataMode(false);
    setCurrentStep(0);
    message.info('已取消更新操作');
  };

  // 更新数据采集进度
  const updateDataCollectionProgress = () => {
    const totalSources = uploadedFiles.length + apiConnections.length;
    const progress = Math.min(totalSources * 20, 100);
    setDataCollectionProgress(progress);
  };

  // 移除文件
  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    updateDataCollectionProgress();
  };

  // 同步API数据
  const syncApiData = (index) => {
    message.info('正在同步数据...');
    // 模拟同步过程
    setTimeout(() => {
      message.success('数据同步完成！');
    }, 1000);
  };

  // 获取文件图标
  const getFileIcon = (fileType) => {
    if (fileType.startsWith('audio/')) {
      return <AudioOutlined style={{ color: '#1890ff' }} />;
    } else if (fileType.startsWith('video/')) {
      return <VideoCameraOutlined style={{ color: '#722ed1' }} />;
    } else if (fileType.includes('pdf')) {
      return <FilePdfOutlined style={{ color: '#f5222d' }} />;
    } else if (fileType.startsWith('image/')) {
      return <FileImageOutlined style={{ color: '#52c41a' }} />;
    } else if (fileType.includes('sheet') || fileType.includes('excel')) {
      return <TableOutlined style={{ color: '#fa8c16' }} />;
    } else {
      return <FileTextOutlined style={{ color: '#8c8c8c' }} />;
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleAddEvent = (values) => {
    // 这里应该调用API添加新事件
    message.success('事件添加成功！');
    setIsAddingEvent(false);
    form.resetFields();
  };

  // 框架构建相关处理函数
  const handleAddModule = (values) => {
    const newModule = {
      id: frameworkModules.length + 1,
      ...values,
      status: "active",
      confidence: 85,
      indicators: [],
      requirements: [],
      interventions: [],
      treeStructure: {
        title: values.name,
        key: values.name.toLowerCase().replace(/\s+/g, '_'),
        children: []
      }
    };
    setFrameworkModules([...frameworkModules, newModule]);
    setIsAddingModule(false);
    frameworkForm.resetFields();
    message.success('模块添加成功！');
  };

  const handleEditModule = (values) => {
    const updatedModules = frameworkModules.map(module => 
      module.id === selectedModule.id ? { ...module, ...values } : module
    );
    setFrameworkModules(updatedModules);
    setIsEditingModule(false);
    setSelectedModule(null);
    moduleForm.resetFields();
    message.success('模块更新成功！');
  };

  const handleDeleteModule = (moduleId) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个模块吗？',
      onOk() {
        setFrameworkModules(frameworkModules.filter(m => m.id !== moduleId));
        message.success('模块删除成功！');
      }
    });
  };


  const handleExport = () => {
    const exportData = frameworkModules.map(module => ({
      '模块名称': module.name,
      '描述': module.description,
      '分类': module.category,
      '优先级': module.priority,
      '状态': module.status,
      '置信度': module.confidence
    }));
    console.log('导出数据:', exportData);
    message.success('数据导出成功！');
  };

  // 渲染文件上传区域
  const renderFileUploadSection = () => (
    <div style={{ padding: '0', margin: '0' }}>
      {/* 第一行：音频和视频文件 */}
      <div style={{ marginBottom: '32px' }}>
        <Row gutter={24}>
          <Col span={12}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AudioOutlined style={{ color: '#1890ff' }} />
                  <span>音频文件</span>
                </div>
              }
              hoverable
              style={{ height: '260px', marginBottom: '0' }}
              bodyStyle={{ padding: '20px' }}
            >
              <Upload.Dragger
                name="audio"
                multiple={true}
                accept="audio/*"
                beforeUpload={handleFileUpload}
                showUploadList={false}
                style={{ 
                  height: '140px', 
                  border: '2px dashed #d9d9d9', 
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <AudioOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '8px' }} />
                <p className="ant-upload-text" style={{ margin: '6px 0', fontSize: '15px', fontWeight: '500' }}>上传音频文件</p>
                <p className="ant-upload-hint" style={{ fontSize: '13px', margin: '0', color: '#999' }}>支持 MP3、WAV、M4A、FLAC</p>
              </Upload.Dragger>
            </Card>
          </Col>
          
          <Col span={12}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <VideoCameraOutlined style={{ color: '#722ed1' }} />
                  <span>视频文件</span>
                </div>
              }
              hoverable
              style={{ height: '260px', marginBottom: '0' }}
              bodyStyle={{ padding: '20px' }}
            >
              <Upload.Dragger
                name="video"
                multiple={true}
                accept="video/*"
                beforeUpload={handleFileUpload}
                showUploadList={false}
                style={{ 
                  height: '140px', 
                  border: '2px dashed #d9d9d9', 
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <VideoCameraOutlined style={{ fontSize: '32px', color: '#722ed1', marginBottom: '8px' }} />
                <p className="ant-upload-text" style={{ margin: '6px 0', fontSize: '15px', fontWeight: '500' }}>上传视频文件</p>
                <p className="ant-upload-hint" style={{ fontSize: '13px', margin: '0', color: '#999' }}>支持 MP4、AVI、MOV</p>
              </Upload.Dragger>
            </Card>
          </Col>
        </Row>
      </div>
      
      {/* 第二行：文档、图片、表格文件 */}
      <div style={{ marginBottom: '24px' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FilePdfOutlined style={{ color: '#f5222d' }} />
                  <span>文档</span>
                </div>
              }
              hoverable
              style={{ height: '220px', marginBottom: '0' }}
              bodyStyle={{ padding: '16px' }}
            >
              <Upload.Dragger
                name="document"
                multiple={true}
                accept=".pdf,.doc,.docx,.txt"
                beforeUpload={handleFileUpload}
                showUploadList={false}
                style={{ 
                  height: '110px', 
                  border: '2px dashed #d9d9d9', 
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <FilePdfOutlined style={{ fontSize: '28px', color: '#f5222d', marginBottom: '6px' }} />
                <p className="ant-upload-text" style={{ margin: '3px 0', fontSize: '13px', fontWeight: '500' }}>PDF/DOC</p>
                <p className="ant-upload-hint" style={{ fontSize: '11px', margin: '0', color: '#999' }}>体检报告、病历等</p>
              </Upload.Dragger>
            </Card>
          </Col>
          
          <Col span={8}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileImageOutlined style={{ color: '#52c41a' }} />
                  <span>图片</span>
                </div>
              }
              hoverable
              style={{ height: '220px', marginBottom: '0' }}
              bodyStyle={{ padding: '16px' }}
            >
              <Upload.Dragger
                name="image"
                multiple={true}
                accept="image/*"
                beforeUpload={handleFileUpload}
                showUploadList={false}
                style={{ 
                  height: '110px', 
                  border: '2px dashed #d9d9d9', 
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <FileImageOutlined style={{ fontSize: '28px', color: '#52c41a', marginBottom: '6px' }} />
                <p className="ant-upload-text" style={{ margin: '3px 0', fontSize: '13px', fontWeight: '500' }}>JPG/PNG</p>
                <p className="ant-upload-hint" style={{ fontSize: '11px', margin: '0', color: '#999' }}>检查报告、X光片等</p>
              </Upload.Dragger>
            </Card>
          </Col>
          
          <Col span={8}>
            <Card 
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TableOutlined style={{ color: '#fa8c16' }} />
                  <span>表格</span>
                </div>
              }
              hoverable
              style={{ height: '220px', marginBottom: '0' }}
              bodyStyle={{ padding: '16px' }}
            >
              <Upload.Dragger
                name="table"
                multiple={true}
                accept=".xls,.xlsx,.csv"
                beforeUpload={handleFileUpload}
                showUploadList={false}
                style={{ 
                  height: '110px', 
                  border: '2px dashed #d9d9d9', 
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <TableOutlined style={{ fontSize: '28px', color: '#fa8c16', marginBottom: '6px' }} />
                <p className="ant-upload-text" style={{ margin: '3px 0', fontSize: '13px', fontWeight: '500' }}>XLS/CSV</p>
                <p className="ant-upload-hint" style={{ fontSize: '11px', margin: '0', color: '#999' }}>体检数据、用药记录等</p>
              </Upload.Dragger>
            </Card>
          </Col>
        </Row>
      </div>
      
      <Alert
        message="文件上传提示"
        description="支持多种格式的健康相关文件，系统将自动识别文件类型并进行相应的智能分析处理。"
        type="info"
        showIcon
        style={{ marginTop: '24px' }}
      />
    </div>
  );

  // 渲染API接口接入区域
  const renderApiConnectionSection = () => (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MobileOutlined style={{ color: '#1890ff' }} />
                <span>可穿戴设备</span>
              </div>
            }
            hoverable
            style={{ height: '200px' }}
            bodyStyle={{ padding: '16px' }}
          >
            <div style={{ 
              textAlign: 'center', 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              padding: '8px'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>
                <MobileOutlined style={{ color: '#1890ff' }} />
              </div>
              <Title level={5} style={{ marginBottom: '6px', fontSize: '16px' }}>Apple Health</Title>
              <Text type="secondary" style={{ marginBottom: '12px', fontSize: '12px' }}>同步心率、步数、睡眠数据</Text>
              <Button type="primary" size="small" style={{ borderRadius: '16px', fontSize: '12px' }}>
                连接设备
              </Button>
            </div>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card 
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DesktopOutlined style={{ color: '#52c41a' }} />
                <span>医院系统</span>
              </div>
            }
            hoverable
            style={{ height: '200px' }}
            bodyStyle={{ padding: '16px' }}
          >
            <div style={{ 
              textAlign: 'center', 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center',
              padding: '8px'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>
                <DesktopOutlined style={{ color: '#52c41a' }} />
              </div>
              <Title level={5} style={{ marginBottom: '6px', fontSize: '16px' }}>HIS系统</Title>
              <Text type="secondary" style={{ marginBottom: '12px', fontSize: '12px' }}>同步检查报告、诊断信息</Text>
              <Button type="primary" size="small" style={{ borderRadius: '16px', fontSize: '12px' }}>
                配置接口
              </Button>
            </div>
          </Card>
        </Col>
      </Row>
      
      <Alert
        message="API接口接入"
        description="通过标准API接口接入第三方健康数据源，实现数据的自动同步和实时更新。"
        type="info"
        showIcon
        style={{ marginTop: 16 }}
      />
    </div>
  );

  // 渲染手动录入区域
  const renderManualInputSection = () => (
    <div>
      <Row gutter={[16, 24]}>
        <Col span={12}>
          <Card title="基础信息" hoverable style={{ height: '280px' }}>
            <Form layout="vertical" style={{ padding: '8px 0' }}>
              <Form.Item label="姓名">
                <Input placeholder="请输入姓名" size="large" />
              </Form.Item>
              <Form.Item label="年龄">
                <Input placeholder="请输入年龄" size="large" />
              </Form.Item>
              <Form.Item label="性别">
                <Select placeholder="请选择性别" size="large">
                  <Option value="male">男</Option>
                  <Option value="female">女</Option>
                </Select>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card title="健康档案" hoverable style={{ height: '280px' }}>
            <Form layout="vertical" style={{ padding: '8px 0' }}>
              <Form.Item label="既往病史">
                <TextArea rows={3} placeholder="请输入既往病史" />
              </Form.Item>
              <Form.Item label="家族病史">
                <TextArea rows={3} placeholder="请输入家族病史" />
              </Form.Item>
              <Form.Item label="过敏史">
                <Input placeholder="请输入过敏史" size="large" />
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
      
      <Alert
        message="手动信息录入"
        description="通过表单方式录入基础健康信息，系统将自动结构化存储并与其它数据源进行关联分析。"
        type="info"
        showIcon
        style={{ marginTop: 24 }}
      />
    </div>
  );

  // 渲染实时同步区域
  const renderRealtimeSyncSection = () => (
    <div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card title="实时数据同步状态" hoverable style={{ height: '180px' }} bodyStyle={{ padding: '12px' }}>
            <Row gutter={[8, 8]} style={{ height: '100%' }}>
              <Col span={8}>
                <div style={{ 
                  textAlign: 'center', 
                  padding: '12px', 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center',
                  borderRight: '1px solid #f0f0f0'
                }}>
                  <SyncIcon style={{ fontSize: '32px', color: '#52c41a', marginBottom: '8px' }} />
                  <Title level={5} style={{ marginBottom: '4px', fontSize: '14px' }}>智能设备</Title>
                  <Text type="secondary" style={{ marginBottom: '8px', fontSize: '11px' }}>血压计、血糖仪等</Text>
                  <Tag color="green" style={{ fontSize: '10px' }}>已连接</Tag>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ 
                  textAlign: 'center', 
                  padding: '12px', 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center',
                  borderRight: '1px solid #f0f0f0'
                }}>
                  <DatabaseOutlined style={{ fontSize: '32px', color: '#1890ff', marginBottom: '8px' }} />
                  <Title level={5} style={{ marginBottom: '4px', fontSize: '14px' }}>云端数据</Title>
                  <Text type="secondary" style={{ marginBottom: '8px', fontSize: '11px' }}>健康管理APP</Text>
                  <Tag color="blue" style={{ fontSize: '10px' }}>同步中</Tag>
                </div>
              </Col>
              <Col span={8}>
                <div style={{ 
                  textAlign: 'center', 
                  padding: '12px', 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  justifyContent: 'center'
                }}>
                  <ThunderboltOutlined style={{ fontSize: '32px', color: '#fa8c16', marginBottom: '8px' }} />
                  <Title level={5} style={{ marginBottom: '4px', fontSize: '14px' }}>IoT设备</Title>
                  <Text type="secondary" style={{ marginBottom: '8px', fontSize: '11px' }}>智能家居健康设备</Text>
                  <Tag color="orange" style={{ fontSize: '10px' }}>待连接</Tag>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
      
      <Alert
        message="实时数据同步"
        description="通过IoT设备和云端服务实现健康数据的实时同步，确保数据的时效性和准确性。"
        type="info"
        showIcon
        style={{ marginTop: 16 }}
      />
    </div>
  );

  const getEventTypeColor = (type) => {
    const colors = {
      medical: 'red',
      improvement: 'green',
      stress: 'orange',
      lifestyle: 'blue',
      social: 'purple'
    };
    return colors[type] || 'default';
  };

  // 框架构建渲染函数
  const renderFrameworkModuleList = () => (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4} style={{ margin: 0 }}>系统性问题解决框架</Title>
        <Space>
          <Button 
            icon={<ExportOutlined />}
            onClick={handleExport}
          >
            导出数据
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setIsAddingModule(true)}
          >
            添加模块
          </Button>
        </Space>
      </div>

      <Row gutter={[16, 16]}>
        {frameworkModules.map(module => (
          <Col span={8} key={module.id}>
            <Card
              hoverable
              style={{ 
                height: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                position: 'relative'
              }}
              actions={[
                <EyeOutlined key="view" onClick={(e) => {
                  e.stopPropagation();
                  setSelectedModule(module);
                  setDrawerVisible(true);
                }} />,
                <EditOutlined key="edit" onClick={(e) => {
                  e.stopPropagation();
                  setSelectedModule(module);
                  setIsEditingModule(true);
                  moduleForm.setFieldsValue(module);
                }} />,
                <DeleteOutlined key="delete" onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteModule(module.id);
                }} />
              ]}
              onClick={() => {
                setSelectedModuleForFlowchart(module);
                setFrameworkActiveTab('flowchart');
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              }}
            >
              <Card.Meta
                title={
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text strong>{module.name}</Text>
                    <Badge 
                      status={module.status === 'active' ? 'success' : 'default'} 
                      text={module.status === 'active' ? '活跃' : '非活跃'}
                    />
                  </div>
                }
                description={
                  <div>
                    <Paragraph ellipsis={{ rows: 2 }} style={{ marginBottom: 8 }}>
                      {module.description}
                    </Paragraph>
                    <Space>
                      <Tag color="blue">{module.category}</Tag>
                      <Tag color="green">优先级: {module.priority}</Tag>
                      <Tag color="orange">置信度: {module.confidence}%</Tag>
                    </Space>
                    <div style={{ 
                      marginTop: 12, 
                      padding: '8px 12px', 
                      backgroundColor: '#f0f9ff', 
                      border: '1px solid #0ea5e9', 
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      color: '#0369a1',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}>
                      <span>点击查看流程图</span>
                      <span style={{ fontSize: '16px' }}>→</span>
                    </div>
                  </div>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );


  // 基于Mermaid流程图的树形数据
  const flowchartData = {
    key: 'stress-screening',
    title: '脑一心一身压力筛查',
    type: 'root',
    children: [
      {
        key: 'risk-positioning',
        title: '超早期风险定位',
        type: 'decision',
        children: [
          {
            key: 'ai-fundus',
            title: '鹰瞳 AI 眼底健康筛查',
            type: 'assessment',
            children: [
              {
                key: 'retinal-assessment',
                title: '视网膜小血管微循环异常评估',
                type: 'detail'
              }
            ]
          },
          {
            key: 'mmri-service',
            title: '细胞能量波动检测服务 (MMRI)',
            type: 'assessment',
            children: [
              {
                key: 'energy-assessment',
                title: '全身细胞能量波动及脑部供能状态',
                type: 'detail'
              }
            ]
          },
          {
            key: 'wearable-device',
            title: '智能穿戴产品',
            type: 'assessment',
            children: [
              {
                key: 'sleep-stress-monitoring',
                title: '睡眠、压力指数实时监测',
                type: 'detail'
              }
            ]
          }
        ]
      }
    ],
    interventions: [
      {
        key: 'precise-intervention',
        title: '精准干预路径',
        type: 'intervention',
        children: [
          {
            key: 'vascular-protection',
            title: '针对微循环异常推荐脑血管保护方案',
            type: 'strategy'
          },
          {
            key: 'breathing-training',
            title: '基于能量波动结果定制间歇性低强度呼吸训练',
            type: 'strategy'
          },
          {
            key: 'smart-reminders',
            title: '智能穿戴推送睡眠规律和压力管理提醒',
            type: 'strategy'
          }
        ]
      }
    ],
    outcome: {
      key: 'effect-tracking',
      title: '效果追踪:月度复测+AI报告解读',
      type: 'outcome'
    }
  };

  // 基于图片内容的树形解决方案数据
  const solutionTrees = [
    {
      key: 'solution1',
      title: '方案一：胃食管反流病理干预理论框架',
      color: '#ff7875',
      description: '基于国际GERD诊疗指南的阶梯治疗原则',
      applicableModule: '模块一：胃食管反流核心病理管理',
      rootNode: '胃食管反流病理综合干预体系',
      children: [
        {
          key: 'branch1',
          title: '分支1：诊断确认路径',
          description: '明确病理类型和严重程度',
          children: [
            { key: 'symptom', title: '症状评估', description: '症状类型和强度分析' },
            { key: 'organic', title: '器质性病变筛查', description: '内镜检查和影像学评估' },
            { key: 'functional', title: '功能性异常识别', description: '食管功能检测' },
            { key: 'reflux', title: '反流定量分析', description: 'pH监测和阻抗检测' }
          ]
        },
        {
          key: 'branch2',
          title: '分支2：药物干预策略',
          description: '控制胃酸分泌，促进黏膜修复',
          children: [
            { key: 'basic', title: '基础干预', description: 'PPI/H2RA选择' },
            { key: 'enhanced', title: '强化干预', description: '促动力药物' },
            { key: 'protective', title: '保护性干预', description: '黏膜保护剂' },
            { key: 'maintenance', title: '维持干预', description: '长期药物调整' }
          ]
        },
        {
          key: 'branch3',
          title: '分支3：非药物干预体系',
          description: '减少反流诱因，增强防御机制',
          children: [
            { key: 'physical', title: '物理干预', description: '体位调整' },
            { key: 'physiological', title: '生理干预', description: '括约肌训练' },
            { key: 'behavioral', title: '行为干预', description: '饮食习惯' },
            { key: 'environmental', title: '环境干预', description: '睡眠环境' }
          ]
        },
        {
          key: 'branch4',
          title: '分支4：并发症预防管理',
          description: '阻断病理进展，预防恶性转化',
          children: [
            { key: 'short', title: '短期监测', description: '症状变化追踪' },
            { key: 'mid', title: '中期监测', description: '黏膜愈合评估' },
            { key: 'long', title: '长期监测', description: '复发风险控制' }
          ]
        }
      ]
    },
    {
      key: 'solution2',
      title: '方案二：生活方式重塑理论体系',
      color: '#52c41a',
      description: '行为改变跨理论模型与习惯养成神经科学',
      applicableModule: '模块二：致病生活方式纠正系统',
      rootNode: '致病生活方式系统性重塑框架',
      children: [
        {
          key: 'chrono',
          title: '分支1：时间生物学调控',
          description: '基于昼夜节律和消化系统同步',
          children: [
            { key: 'meal', title: '进餐时间调节', description: '定时进餐机制' },
            { key: 'digestive', title: '消化周期管理', description: '消化节律优化' },
            { key: 'sleep', title: '睡眠窗口设定', description: '睡眠时间管理' }
          ]
        },
        {
          key: 'eating',
          title: '分支2：饮食行为重构',
          description: '认知-情绪-行为三元交互模型',
          children: [
            { key: 'cognitive', title: '认知重构', description: '食物-症状映射' },
            { key: 'emotional', title: '情绪调节', description: '进食情绪管理' },
            { key: 'behavioral', title: '行为塑造', description: '正念进食' },
            { key: 'environmental', title: '环境设计', description: '进食环境优化' }
          ]
        },
        {
          key: 'addiction',
          title: '分支3：成瘾行为阻断',
          description: '基于神经可塑性和奖赏通路重构',
          children: [
            { key: 'caffeine', title: '咖啡因减量', description: '渐进式减量策略' },
            { key: 'spicy', title: '辛辣食物适应', description: '味觉敏感度调节' },
            { key: 'fast', title: '快速进食习惯重训', description: '进食速度控制' }
          ]
        },
        {
          key: 'sleep',
          title: '分支4：睡眠卫生工程',
          description: '睡眠环境和体位的生物力学优化框架',
          children: [
            { key: 'posture', title: '体位工程', description: '抗反流体位' },
            { key: 'environment', title: '环境控制', description: '温湿度调节' },
            { key: 'rhythm', title: '节律调节', description: '褪黑素-胃酸协调' }
          ]
        }
      ]
    },
    {
      key: 'solution3',
      title: '方案三：烟草依赖终止理论模型',
      color: '#1890ff',
      description: '尼古丁成瘾神经生物学与行为替代理论',
      applicableModule: '模块三：烟草依赖干预系统',
      rootNode: '烟草依赖多维度终止策略体系',
      children: [
        {
          key: 'assessment',
          title: '分支1：成瘾评估与分型',
          description: '生理、心理、社会依赖评估',
          children: [
            { key: 'physiological', title: '生理依赖', description: '尼古丁依赖程度' },
            { key: 'psychological', title: '心理依赖', description: '心理渴求强度' },
            { key: 'social', title: '社会依赖', description: '社交环境因素' }
          ]
        },
        {
          key: 'neurobiological',
          title: '分支2：神经生物学干预',
          description: '受体水平、神经递质、戒断症状',
          children: [
            { key: 'receptor', title: '受体水平干预', description: '拮抗/替代策略' },
            { key: 'neurotransmitter', title: '神经递质调节', description: '多巴胺系统调节' },
            { key: 'withdrawal', title: '戒断症状缓解', description: '药物辅助戒断' }
          ]
        },
        {
          key: 'behavioral',
          title: '分支3：行为替代系统',
          description: '口腔满足、手部活动、无烟社交仪式',
          children: [
            { key: 'oral', title: '口腔满足替代', description: '口香糖、硬糖等' },
            { key: 'hand', title: '手部活动替代', description: '手指操、握力器' },
            { key: 'social', title: '无烟社交仪式', description: '社交行为重构' },
            { key: 'stress', title: '非烟草压力缓解', description: '压力管理技巧' }
          ]
        },
        {
          key: 'prevention',
          title: '分支4：复吸预防框架',
          description: '高风险情境识别和应对技能训练',
          children: [
            { key: 'internal', title: '内部触发因素', description: '情绪、压力识别' },
            { key: 'external', title: '外部触发因素', description: '环境、社交识别' },
            { key: 'mixed', title: '混合触发因素', description: '复合情境应对' }
          ]
        }
      ]
    }
  ];

  // Mermaid流程图组件
  const MermaidFlowchart = ({ mermaidCode, title }) => {
    console.log('🎨 MermaidFlowchart 组件渲染');
    console.log('🎨 当前时间戳:', Date.now());
    console.log('🎨 组件渲染次数:', Math.random());
    
    const mermaidRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chartId] = useState(`mermaid-chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
    
    console.log('🎨 mermaidRef.current 初始值:', mermaidRef.current);
    console.log('🎨 chartId:', chartId);
    console.log('🎨 isLoading:', isLoading);
    console.log('🎨 error:', error);

    useEffect(() => {
      console.log('🎨 Mermaid useEffect 执行，chartId:', chartId);
      const currentMermaidCode = mermaidCode || mermaidDefinition;
      console.log('🎨 Mermaid 定义字符串长度:', currentMermaidCode.length);
      console.log('🎨 Mermaid 定义字符串前100字符:', currentMermaidCode.substring(0, 100));
      console.log('🎨 useEffect中 mermaidRef.current:', mermaidRef.current);
      console.log('🎨 useEffect中 isLoading:', isLoading);
      
      let isMounted = true;
      console.log('🎨 useEffect中 isMounted 设置为:', isMounted);

      // 初始化Mermaid
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
          curve: 'basis'
        },
        securityLevel: 'loose'
      });

      // 渲染图表
      const renderChart = async () => {
        try {
          console.log('🎨 Mermaid renderChart 开始执行');
          console.log('🎨 Mermaid isMounted:', isMounted);
          console.log('🎨 Mermaid mermaidRef.current:', mermaidRef.current);
          
          if (!isMounted) {
            console.log('🎨 Mermaid 组件已卸载，跳过渲染');
            return;
          }
          
          setIsLoading(true);
          setError(null);
          
          const element = mermaidRef.current;
          console.log('🎨 Mermaid 目标元素:', element);
          console.log('🎨 Mermaid 目标元素存在:', !!element);
          console.log('🎨 Mermaid 目标元素类型:', typeof element);
          
          if (element && isMounted) {
            console.log('🎨 Mermaid 开始清理DOM，子元素数量:', element.children.length);
            // 安全地清理现有内容
            while (element.firstChild) {
              element.removeChild(element.firstChild);
            }
            console.log('🎨 Mermaid DOM清理完成');
            
            console.log('🎨 Mermaid 开始渲染，chartId:', chartId);
            const { svg } = await mermaid.render(chartId, currentMermaidCode);
            console.log('🎨 Mermaid 渲染完成，SVG长度:', svg.length);
            console.log('🎨 Mermaid SVG前200字符:', svg.substring(0, 200));
            
            if (isMounted && element) {
              element.innerHTML = svg;
              console.log('🎨 Mermaid SVG已插入DOM');
              console.log('🎨 Mermaid DOM插入后子元素数量:', element.children.length);
            }
          } else {
            console.log('🎨 Mermaid 跳过渲染：元素不存在或组件已卸载');
          }
        } catch (error) {
          console.error('Mermaid渲染错误:', error);
          if (isMounted) {
            setError(error.message);
            message.error('流程图渲染失败: ' + error.message);
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };

      // 延迟渲染，确保DOM已准备好
      const timer = setTimeout(() => {
        console.log('🎨 延迟渲染开始，检查DOM元素');
        console.log('🎨 mermaidRef.current:', mermaidRef.current);
        console.log('🎨 isMounted:', isMounted);
        if (mermaidRef.current && isMounted) {
          console.log('🎨 条件满足，开始调用renderChart');
          renderChart();
        } else {
          console.log('🎨 DOM元素仍未准备好，再次延迟');
          console.log('🎨 延迟原因 - mermaidRef.current:', mermaidRef.current);
          console.log('🎨 延迟原因 - isMounted:', isMounted);
          setTimeout(() => {
            console.log('🎨 第二次延迟渲染开始');
            console.log('🎨 第二次延迟时 mermaidRef.current:', mermaidRef.current);
            console.log('🎨 第二次延迟时 isMounted:', isMounted);
            if (mermaidRef.current && isMounted) {
              console.log('🎨 第二次延迟条件满足，调用renderChart');
              renderChart();
            } else {
              console.log('🎨 第二次延迟仍然失败');
            }
          }, 200);
        }
      }, 100);

      // 清理函数
      return () => {
        isMounted = false;
        clearTimeout(timer);
      };
    }, [chartId, mermaidCode]);

    console.log('🎨 MermaidFlowchart 组件即将返回JSX');
    console.log('🎨 返回时 mermaidRef.current:', mermaidRef.current);
    console.log('🎨 返回时 isLoading:', isLoading);
    console.log('🎨 返回时 error:', error);
    
    return (
      <div>
        <Card style={{ padding: '24px' }}>
          <div 
            ref={(el) => {
              console.log('🎨 ref回调函数被调用，el:', el);
              mermaidRef.current = el;
              console.log('🎨 ref设置后 mermaidRef.current:', mermaidRef.current);
            }}
            style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              minHeight: '600px',
              overflow: 'auto',
              border: '1px dashed #d9d9d9',
              borderRadius: '4px',
              backgroundColor: '#fafafa',
              position: 'relative'
            }}
          >
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Progress type="circle" percent={75} />
                <div style={{ marginTop: '16px' }}>正在渲染流程图...</div>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Alert
                  message="流程图渲染失败"
                  description={error}
                  type="error"
                  showIcon
                />
                <div style={{ marginTop: '16px', fontSize: '12px', color: '#666' }}>
                  请检查浏览器控制台获取详细错误信息
                </div>
              </div>
            ) : (
              <div style={{ color: '#999', fontSize: '14px' }}>
                流程图将在此处显示...
              </div>
            )}
          </div>
        </Card>
    </div>
  );
  };

  // Mermaid图表定义 - 无背景框版胃食管反流病理干预理论框架
  const mermaidDefinition = `
    graph TD
      A["胃食管反流病理干预理论框架"]
      
      A --> D1["基础干预<br/>PPI/H2RA"]
      A --> D2["强化干预<br/>促动力药物"]
      A --> D3["保护性干预<br/>黏膜保护剂"]
      A --> D4["维持干预<br/>长期药物调整"]
      
      D1 --> E1["物理干预<br/>体位调整"]
      D2 --> E2["生理干预<br/>括约肌训练"]
      D3 --> E3["行为干预<br/>饮食习惯"]
      D4 --> E4["环境干预<br/>睡眠环境"]
      
      E1 --> F1["短期监测<br/>症状变化"]
      E2 --> F2["中期监测<br/>黏膜愈合"]
      E3 --> F3["长期监测<br/>复发风险"]
      E4 --> F4["干预升级<br/>基于监测结果"]
      
      F1 --> G["预期成效"]
      F2 --> G
      F3 --> G
      F4 --> G
      
      G --> H1["症状缓解率<br/>4周内60-70%"]
      G --> H2["黏膜愈合率<br/>8周内70-80%"]
      G --> H3["复发控制<br/>6个月内20-30%"]
      
      classDef rootNode fill:#f8f9fa,stroke:#495057,stroke-width:3px,color:#212529,font-weight:bold
      classDef drugNode fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,color:#495057
      classDef nonDrugNode fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,color:#495057
      classDef preventionNode fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,color:#495057
      classDef outcomeNode fill:#e9ecef,stroke:#495057,stroke-width:2px,color:#212529,font-weight:500
      classDef resultNode fill:#f8f9fa,stroke:#6c757d,stroke-width:2px,color:#495057
      
      class A rootNode
      class D1,D2,D3,D4 drugNode
      class E1,E2,E3,E4 nonDrugNode
      class F1,F2,F3,F4 preventionNode
      class G outcomeNode
      class H1,H2,H3 resultNode
  `;

  // 从需求评估数据中提取关键指标的函数
  const extractKeyIndicatorsFromRequirements = (moduleName) => {
    // 基于需求评估阶段的原始数据，提取关键指标，每个指标对应多个需求评估条目
    const requirementData = {
      "C1 睡眠-交感型疲劳系统": {
        stages: [
          {
            name: "睡眠问题评估",
            indicators: [
              {
                name: "心率变异性HRV（>30ms为正常）",
                sources: [
                  "需求评估：工作压力大→HPA轴激活→皮质醇持续分泌↑",
                  "需求评估：疲劳感增加→交感神经持续兴奋→心率↑、血压↑",
                  "需求评估：长期压力→偏头痛或紧张性头痛发作频率↑"
                ]
              },
              {
                name: "皮质醇节律（晨起峰值，夜间低谷）",
                sources: [
                  "需求评估：工作压力大→HPA轴激活→皮质醇持续分泌↑→抑制褪黑素合成",
                  "需求评估：睡眠质量下降+工作压力→睡眠障碍风险增加",
                  "需求评估：长期压力+睡眠质量下降→免疫功能抑制（T细胞活性↓）"
                ]
              },
              {
                name: "ASCVD风险评分（<5%为低风险）",
                sources: [
                  "需求评估：疲劳感增加→交感神经持续兴奋→心血管系统负荷加重",
                  "需求评估：超重+工作压力→血压监测（收缩压/舒张压可能≥130/80 mmHg）",
                  "需求评估：长期久坐→血脂异常（LDL-C↑、HDL-C↓）→动脉粥样硬化风险评估"
                ]
              },
              {
                name: "睡眠质量评分（PSQI量表>7分）",
                sources: [
                  "需求评估：睡眠质量下降+工作压力→睡眠障碍风险增加",
                  "需求评估：睡眠障碍→生物钟紊乱→双向情感障碍早期症状排查",
                  "需求评估：睡眠质量下降→多导睡眠图（PSG）检查→排除阻塞性睡眠呼吸暂停低通气综合征"
                ]
              },
              {
                name: "疲劳感自评（1-10分，<6分为正常）",
                sources: [
                  "需求评估：疲劳感增加→交感神经持续兴奋→心率↑、血压↑",
                  "需求评估：睡眠剥夺→下丘脑食欲调节因子失衡（瘦素↓、饥饿素↑）",
                  "需求评估：压力应激→端粒酶活性下降→细胞衰老加速"
                ]
              }
            ],
            criteria: "综合多个需求评估条目：工作压力→HPA轴激活→皮质醇分泌→睡眠周期紊乱→疲劳感增加→心血管风险"
          },
          {
            name: "压力管理评估",
            indicators: [
              {
                name: "工作压力评分（1-10分）",
                sources: [
                  "需求评估：IT工作996+疲劳症状→工作压力过大",
                  "需求评估：健康话题职场禁忌+情绪压抑→心理健康咨询利用率<5%",
                  "需求评估：压力认知评估→非理性信念（如'必须完美完成工作'）"
                ]
              },
              {
                name: "交感神经兴奋度",
                sources: [
                  "需求评估：疲劳感增加→交感神经持续兴奋→心率↑、血压↑",
                  "需求评估：工作压力大→HPA轴激活→皮质醇持续分泌↑",
                  "需求评估：长期压力→偏头痛或紧张性头痛发作频率↑"
                ]
              },
              {
                name: "疲劳恢复能力",
                sources: [
                  "需求评估：睡眠质量下降+工作压力→睡眠障碍风险增加",
                  "需求评估：睡眠剥夺→下丘脑食欲调节因子失衡→中枢性食欲亢进",
                  "需求评估：压力应激→端粒酶活性下降→细胞衰老加速"
                ]
              }
            ],
            criteria: "综合多个需求评估条目：工作压力→交感激活→疲劳感→恢复能力下降→健康风险增加"
          }
        ]
      },
      "C2 代谢风险预警系统": {
        stages: [
          {
            name: "代谢风险评估",
            indicators: [
              {
                name: "空腹血糖（3.9-6.1mmol/L）",
                sources: [
                  "需求评估：疲劳+睡眠障碍→血糖检测（空腹血糖≥6.1 mmol/L）→糖调节受损",
                  "需求评估：超重（BMI 25.9）→腹腔脂肪堆积→胰岛素抵抗风险↑",
                  "需求评估：睡眠剥夺→下丘脑食欲调节因子失衡（瘦素↓、饥饿素↑）→能量代谢紊乱"
                ]
              },
              {
                name: "餐后2小时血糖（<7.8mmol/L）",
                sources: [
                  "需求评估：超重→脂肪细胞因子分泌异常（如瘦素抵抗）→诱发胰岛素抵抗",
                  "需求评估：长期久坐→血脂异常（LDL-C↑、HDL-C↓）→动脉粥样硬化风险评估",
                  "需求评估：久坐IT职业→腰椎MRI检查（L4-L5椎间盘突出可能）→骨科干预"
                ]
              },
              {
                name: "糖化血红蛋白（<5.7%）",
                sources: [
                  "需求评估：超重（BMI 25.9）→腹腔脂肪堆积→胰岛素抵抗风险↑",
                  "需求评估：疲劳+睡眠障碍→血糖检测（空腹血糖≥6.1 mmol/L）→糖调节受损",
                  "需求评估：长期久坐→血脂异常（LDL-C↑、HDL-C↓）→动脉粥样硬化风险评估"
                ]
              },
              {
                name: "BMI指数（18.5-24.9）",
                sources: [
                  "需求评估：超重（BMI 25.9）→腹腔脂肪堆积→胰岛素抵抗风险↑",
                  "需求评估：若携带FTO基因变异→肥胖易感性增加→与环境因素（久坐、高糖饮食）协同",
                  "需求评估：睡眠剥夺→下丘脑食欲调节因子失衡（瘦素↓、饥饿素↑）→中枢性食欲亢进"
                ]
              },
              {
                name: "腰围（男<90cm，女<85cm）",
                sources: [
                  "需求评估：超重（BMI 25.9）→体脂分布异常→腹腔内脂肪堆积",
                  "需求评估：久坐IT职业→腰椎MRI检查（L4-L5椎间盘突出可能）→骨科干预",
                  "需求评估：长期久坐→血脂异常（LDL-C↑、HDL-C↓）→动脉粥样硬化风险评估"
                ]
              }
            ],
            criteria: "综合多个需求评估条目：超重→脂肪堆积→胰岛素抵抗→血糖异常→代谢综合征风险"
          },
          {
            name: "血糖水平检测",
            indicators: [
              {
                name: "空腹血糖值",
                sources: [
                  "需求评估：疲劳+睡眠障碍→血糖检测（空腹血糖≥6.1 mmol/L）→糖调节受损",
                  "需求评估：超重（BMI 25.9）→腹腔脂肪堆积→胰岛素抵抗风险↑",
                  "需求评估：睡眠剥夺→下丘脑食欲调节因子失衡→能量代谢紊乱"
                ]
              },
              {
                name: "餐后血糖峰值",
                sources: [
                  "需求评估：超重→脂肪细胞因子分泌异常（如瘦素抵抗）→诱发胰岛素抵抗",
                  "需求评估：长期久坐→血脂异常（LDL-C↑、HDL-C↓）→动脉粥样硬化风险评估",
                  "需求评估：久坐IT职业→腰椎MRI检查（L4-L5椎间盘突出可能）→骨科干预"
                ]
              },
              {
                name: "血糖波动幅度",
                sources: [
                  "需求评估：疲劳+睡眠障碍→血糖检测（空腹血糖≥6.1 mmol/L）→糖调节受损",
                  "需求评估：睡眠剥夺→下丘脑食欲调节因子失衡（瘦素↓、饥饿素↑）→中枢性食欲亢进",
                  "需求评估：超重（BMI 25.9）→腹腔脂肪堆积→胰岛素抵抗风险↑"
                ]
              }
            ],
            criteria: "综合多个需求评估条目：代谢异常→血糖波动→胰岛素抵抗→糖尿病前期风险"
          }
        ]
      },
      "C3 结构性阻力-行动中断系统": {
        stages: [
          {
            name: "结构性阻力评估",
            indicators: [
              {
                name: "每日可支配时间（小时）",
                sources: [
                  "需求评估：IT工作996+疲劳症状→工作压力过大→时间管理困难",
                  "需求评估：久坐IT职业→腰椎MRI检查（L4-L5椎间盘突出可能）→骨科干预",
                  "需求评估：工作强度高，久坐办公→健康行为中断"
                ]
              },
              {
                name: "工作强度评分（1-10分）",
                sources: [
                  "需求评估：IT工作996+疲劳症状→工作压力过大",
                  "需求评估：健康话题职场禁忌+情绪压抑→心理健康咨询利用率<5%",
                  "需求评估：压力认知评估→非理性信念（如'必须完美完成工作'）"
                ]
              },
              {
                name: "家庭责任负担（1-10分）",
                sources: [
                  "需求评估：工作强度高，久坐办公→健康行为中断",
                  "需求评估：经济承受能力评估→服务可达性分析",
                  "需求评估：久坐IT职业→腰椎MRI检查（L4-L5椎间盘突出可能）→骨科干预"
                ]
              },
              {
                name: "交通时间成本（分钟）",
                sources: [
                  "需求评估：久坐IT职业→腰椎MRI检查（L4-L5椎间盘突出可能）→骨科干预",
                  "需求评估：工作强度高，久坐办公→健康行为中断",
                  "需求评估：经济承受能力评估→服务可达性分析"
                ]
              },
              {
                name: "经济承受能力（1-10分）",
                sources: [
                  "需求评估：经济承受能力评估→服务可达性分析",
                  "需求评估：健康话题职场禁忌+情绪压抑→心理健康咨询利用率<5%",
                  "需求评估：IT工作996+疲劳症状→工作压力过大→时间管理困难"
                ]
              }
            ],
            criteria: "综合多个需求评估条目：工作压力→时间不足→服务可达性差→健康行为中断→管理困难"
          }
        ]
      },
      "C4 健康观念-认知误区系统": {
        stages: [
          {
            name: "认知误区评估",
            indicators: [
              {
                name: "健康知识正确率（>80%为良好）",
                sources: [
                  "需求评估：压力认知评估→非理性信念（如'必须完美完成工作'）→认知行为疗法（CBT）修正",
                  "需求评估：健康话题职场禁忌+情绪压抑→心理健康咨询利用率<5%",
                  "需求评估：重度焦虑症检出率高出社会均值40%"
                ]
              },
              {
                name: "非理性信念数量（<3个为轻度）",
                sources: [
                  "需求评估：压力认知评估→非理性信念（如'必须完美完成工作'）→认知行为疗法（CBT）修正",
                  "需求评估：健康话题职场禁忌+情绪压抑→心理健康咨询利用率<5%",
                  "需求评估：重度焦虑症检出率高出社会均值40%"
                ]
              },
              {
                name: "健康行为依从性（>70%为良好）",
                sources: [
                  "需求评估：健康知识正确率评估→健康行为依从性分析",
                  "需求评估：工作强度高，久坐办公→健康行为中断",
                  "需求评估：IT工作996+疲劳症状→工作压力过大→时间管理困难"
                ]
              },
              {
                name: "自我效能感评分（1-10分）",
                sources: [
                  "需求评估：压力认知评估→非理性信念（如'必须完美完成工作'）→认知行为疗法（CBT）修正",
                  "需求评估：健康话题职场禁忌+情绪压抑→心理健康咨询利用率<5%",
                  "需求评估：重度焦虑症检出率高出社会均值40%"
                ]
              },
              {
                name: "健康焦虑程度（1-10分）",
                sources: [
                  "需求评估：健康话题职场禁忌+情绪压抑→心理健康咨询利用率<5%",
                  "需求评估：重度焦虑症检出率高出社会均值40%",
                  "需求评估：压力认知评估→非理性信念（如'必须完美完成工作'）→认知行为疗法（CBT）修正"
                ]
              }
            ],
            criteria: "综合多个需求评估条目：认知误区→非理性信念→健康羞耻感→行为依从性差→焦虑增加"
          }
        ]
      },
      "C5 情绪-心理健康系统": {
        stages: [
          {
            name: "情绪健康评估",
            indicators: [
              {
                name: "PHQ-9抑郁量表（<5分正常）",
                sources: [
                  "需求评估：疲劳+工作压力→抑郁焦虑量表（PHQ-9/GAD-7）评估→可能存在轻度抑郁或焦虑障碍",
                  "需求评估：睡眠障碍→生物钟紊乱→双向情感障碍早期症状排查",
                  "需求评估：健康话题职场禁忌+情绪压抑→心理健康咨询利用率<5%"
                ]
              },
              {
                name: "GAD-7焦虑量表（<5分正常）",
                sources: [
                  "需求评估：疲劳+工作压力→抑郁焦虑量表（PHQ-9/GAD-7）评估→可能存在轻度抑郁或焦虑障碍",
                  "需求评估：健康话题职场禁忌+情绪压抑→心理健康咨询利用率<5%",
                  "需求评估：重度焦虑症检出率高出社会均值40%"
                ]
              },
              {
                name: "压力感知量表（1-10分）",
                sources: [
                  "需求评估：IT工作996+疲劳症状→工作压力过大",
                  "需求评估：压力认知评估→非理性信念（如'必须完美完成工作'）",
                  "需求评估：健康话题职场禁忌+情绪压抑→心理健康咨询利用率<5%"
                ]
              },
              {
                name: "情绪调节能力（1-10分）",
                sources: [
                  "需求评估：睡眠障碍→生物钟紊乱→双向情感障碍早期症状排查",
                  "需求评估：疲劳+工作压力→抑郁焦虑量表（PHQ-9/GAD-7）评估→可能存在轻度抑郁或焦虑障碍",
                  "需求评估：压力认知评估→非理性信念（如'必须完美完成工作'）→认知行为疗法（CBT）修正"
                ]
              },
              {
                name: "社会支持评分（1-10分）",
                sources: [
                  "需求评估：健康话题职场禁忌+情绪压抑→心理健康咨询利用率<5%",
                  "需求评估：重度焦虑症检出率高出社会均值40%",
                  "需求评估：睡眠障碍→生物钟紊乱→双向情感障碍早期症状排查"
                ]
              }
            ],
            criteria: "综合多个需求评估条目：工作压力→情绪压抑→焦虑抑郁→社会支持不足→心理健康风险"
          }
        ]
      }
    };

    return requirementData[moduleName] || {
      stages: [{
        name: "通用评估阶段",
        indicators: ["待定指标1", "待定指标2", "待定指标3"],
        criteria: "基于需求评估的原始条目"
      }]
    };
  };

  // 渲染关键指标和判断方式
  const renderKeyIndicators = (module) => {
    const moduleIndicators = extractKeyIndicatorsFromRequirements(module.name);

    return (
      <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
        {moduleIndicators.stages.map((stage, index) => (
          <div key={index} style={{ marginBottom: '20px' }}>
            <div style={{ 
              fontWeight: 'bold', 
              color: '#1890ff', 
              marginBottom: '8px',
              fontSize: '13px',
              borderBottom: '1px solid #f0f0f0',
              paddingBottom: '4px'
            }}>
              {stage.name}
            </div>
            
            <div style={{ marginBottom: '8px' }}>
              <div style={{ fontWeight: 'bold', color: '#666', marginBottom: '4px' }}>
                关键指标：
              </div>
              <div style={{ marginLeft: '16px' }}>
                {stage.indicators.map((indicator, idx) => (
                  <div key={idx} style={{ marginBottom: '12px', padding: '8px', backgroundColor: '#fafafa', borderRadius: '4px', border: '1px solid #e8e8e8' }}>
                    <div style={{ fontWeight: 'bold', color: '#1890ff', marginBottom: '6px', fontSize: '11px' }}>
                      {indicator.name}
                    </div>
                    <div style={{ marginBottom: '4px' }}>
                      <div style={{ fontWeight: 'bold', color: '#666', fontSize: '10px', marginBottom: '2px' }}>
                        合并的需求评估条目：
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '12px' }}>
                        {indicator.sources.map((source, sourceIdx) => (
                          <li key={sourceIdx} style={{ marginBottom: '2px', fontSize: '10px', color: '#666' }}>
                            {source}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div style={{ 
              backgroundColor: '#f6ffed', 
              border: '1px solid #b7eb8f', 
              borderRadius: '4px', 
              padding: '8px',
              fontSize: '11px'
            }}>
              <div style={{ fontWeight: 'bold', color: '#52c41a', marginBottom: '4px' }}>
                综合判断标准：
              </div>
              <div style={{ color: '#666' }}>
                {stage.criteria}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderFlowchartStructure = () => {
    if (selectedModuleForFlowchart) {
      return (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Title level={4}>{selectedModuleForFlowchart.flowchartData.title}</Title>
            <Alert
              message={`当前查看：${selectedModuleForFlowchart.name}`}
              description={selectedModuleForFlowchart.description}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          </div>
          
          {/* 修改为两列布局：左侧流程图，右侧关键指标 */}
          <Row gutter={[24, 16]} style={{ marginBottom: '24px' }}>
            <Col span={16}>
              <MermaidFlowchart 
                mermaidCode={selectedModuleForFlowchart.flowchartData.mermaid}
                title={selectedModuleForFlowchart.flowchartData.title}
              />
            </Col>
            <Col span={8}>
              <Card 
                title="方案执行关键指标" 
                size="small"
                style={{ 
                  height: '1025px', // 增加为1.5倍高度 (600px * 1.5 = 900px)
                  display: 'flex',
                  flexDirection: 'column'
                }}
                bodyStyle={{ 
                  padding: '16px',
                  flex: 1,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ 
                  flex: 1, 
                  overflowY: 'auto',
                  paddingRight: '8px' // 为滚动条留出空间
                }}>
                  {renderKeyIndicators(selectedModuleForFlowchart)}
                </div>
              </Card>
            </Col>
          </Row>
          
          {/* 底部四个信息框，使用全宽布局 */}
          <Row gutter={[16, 16]} justify="center">
          <Col span={6}>
            <Card 
              size="small" 
              title="理论基础" 
              style={{ height: '280px', display: 'flex', flexDirection: 'column' }}
              bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              <div style={{ textAlign: 'center', fontSize: '12px', lineHeight: '1.6' }}>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1890ff' }}>
                  基于国际GERD诊疗指南的阶梯治疗原则
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>适用模块：</strong><br/>
                  模块一_胃食管反流核心病理管理
                </div>
                <div>
                  <strong>核心原则：</strong><br/>
                  • 症状学评估体系构建<br/>
                  • 器质性病变排查机制<br/>
                    • 功能性异常识别标准<br/>
                    • 反流特征量化分析
                </div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              size="small" 
              title="整合机制" 
              style={{ height: '280px', display: 'flex', flexDirection: 'column' }}
              bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              <div style={{ textAlign: 'center', fontSize: '12px', lineHeight: '1.6' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1890ff' }}>
                  时序整合与强度调节
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <strong>时序整合：</strong><br/>
                    • 急性期/巩固期/维持期管理<br/>
                    • 阶梯式升级/降级原则<br/>
                    • 多维度疗效判断体系
                </div>
                  <div>
                  <strong>强度调节：</strong><br/>
                    • 个体化剂量调整<br/>
                    • 联合治疗方案优化<br/>
                    • 不良反应监测管理
                </div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              size="small" 
              title="预期成效理论" 
              style={{ height: '280px', display: 'flex', flexDirection: 'column' }}
              bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              <div style={{ textAlign: 'center', fontSize: '12px', lineHeight: '1.6' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1890ff' }}>
                  多时间维度成效指标
                </div>
                <div style={{ marginBottom: '12px' }}>
                    <strong>短期（4周）：</strong><br/>
                    症状缓解率60-70%<br/>
                    生活质量显著改善
                </div>
                <div style={{ marginBottom: '12px' }}>
                    <strong>中期（8周）：</strong><br/>
                    黏膜愈合率70-80%<br/>
                    炎症指标明显下降
                </div>
                <div>
                    <strong>长期（6个月）：</strong><br/>
                    复发控制率20-30%<br/>
                    维持治疗依从性&gt;80%
                </div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card 
              size="small" 
              title="追踪阶段" 
              style={{ height: '280px', display: 'flex', flexDirection: 'column' }}
              bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              <div style={{ textAlign: 'center', fontSize: '12px', lineHeight: '1.6' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1890ff' }}>
                  持续监测与评估
                </div>
                <div style={{ marginBottom: '12px' }}>
                    <strong>定期复查：</strong><br/>
                    • 每月复查症状及黏膜状态<br/>
                    • AI报告解读治疗效果<br/>
                    • 风险预测与预警机制
                </div>
                <div>
                  <strong>效果评估：</strong><br/>
                    • 综合疗效判断<br/>
                    • 方案调整优化<br/>
                    • 长期预后跟踪
                </div>
              </div>
            </Card>
          </Col>
        </Row>
        </div>
      );
    } else {
      return (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Title level={4}>系统流程图</Title>
            <Alert
              message="请选择一个模块查看对应的流程图"
              description="点击左侧模块管理中的任意模块卡片，即可查看该模块的详细流程图"
              type="info"
              showIcon
            />
          </div>
        </div>
      );
    }
  };

  // 方案详情页面渲染函数
  const renderPlanDetail = () => {
    if (selectedPlanForDetail) {
      const plan = selectedPlanForDetail;
      return (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Title level={4}>{plan.flowchartData.title}</Title>
            <Alert
              message={`当前查看：${plan.plan_name}`}
              description={plan.description}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          </div>
          
          {/* 两列布局：左侧流程图，右侧关键指标 */}
          <Row gutter={[24, 16]} style={{ marginBottom: '24px' }}>
            <Col span={16}>
              <MermaidFlowchart 
                mermaidCode={plan.flowchartData.mermaid}
                title={plan.flowchartData.title}
              />
            </Col>
            <Col span={8}>
              <Card 
                title="方案执行关键指标" 
                size="small"
                style={{ 
                  height: '1025px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                bodyStyle={{ 
                  padding: '16px',
                  flex: 1,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ 
                  flex: 1, 
                  overflowY: 'auto',
                  paddingRight: '8px'
                }}>
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ 
                      fontWeight: 'bold', 
                      color: '#1890ff', 
                      marginBottom: '8px',
                      fontSize: '13px',
                      borderBottom: '1px solid #f0f0f0',
                      paddingBottom: '4px'
                    }}>
                      方案基本信息
                    </div>
                    <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>难度等级：</strong>{plan.difficulty_level}
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>执行强度：</strong>{plan.execution_intensity}
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>目标时长：</strong>{plan.target_duration}
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>总费用：</strong>{plan.total_cost}
                      </div>
                      <div>
                        <strong>框架重点：</strong>{plan.framework_focus}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ 
                      fontWeight: 'bold', 
                      color: '#1890ff', 
                      marginBottom: '8px',
                      fontSize: '13px',
                      borderBottom: '1px solid #f0f0f0',
                      paddingBottom: '4px'
                    }}>
                      预期效果
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px' }}>
                      {plan.expected_outcomes.map((outcome, idx) => (
                        <li key={idx} style={{ marginBottom: '2px' }}>
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ 
                      fontWeight: 'bold', 
                      color: '#1890ff', 
                      marginBottom: '8px',
                      fontSize: '13px',
                      borderBottom: '1px solid #f0f0f0',
                      paddingBottom: '4px'
                    }}>
                      成功指标
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px' }}>
                      {plan.success_indicators.map((indicator, idx) => (
                        <li key={idx} style={{ marginBottom: '2px' }}>
                          {indicator}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ 
                    backgroundColor: '#f6ffed', 
                    border: '1px solid #b7eb8f', 
                    borderRadius: '4px', 
                    padding: '8px',
                    fontSize: '11px'
                  }}>
                    <div style={{ fontWeight: 'bold', color: '#52c41a', marginBottom: '4px' }}>
                      执行建议：
                    </div>
                    <div style={{ color: '#666' }}>
                      严格按照流程图执行，定期评估效果，及时调整方案
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
          
          {/* 底部四个信息框 */}
          <Row gutter={[16, 16]} justify="center">
            <Col span={6}>
              <Card 
                size="small" 
                title="理论基础" 
                style={{ height: '280px', display: 'flex', flexDirection: 'column' }}
                bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <div style={{ textAlign: 'center', fontSize: '12px', lineHeight: '1.6' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1890ff' }}>
                    基于C1C2C3框架的整合干预理论
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>适用方案：</strong><br/>
                    {plan.plan_name}
                  </div>
                  <div>
                    <strong>核心原则：</strong><br/>
                    • 多维度健康评估<br/>
                    • 个性化干预策略<br/>
                    • 阶段性效果监测<br/>
                    • 动态方案调整
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card 
                size="small" 
                title="整合机制" 
                style={{ height: '280px', display: 'flex', flexDirection: 'column' }}
                bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <div style={{ textAlign: 'center', fontSize: '12px', lineHeight: '1.6' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1890ff' }}>
                    多系统协同整合
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>系统整合：</strong><br/>
                    • C1睡眠-交感型疲劳系统<br/>
                    • C2代谢风险预警系统<br/>
                    • C3结构性阻力系统
                  </div>
                  <div>
                    <strong>协同机制：</strong><br/>
                    • 数据共享与联动<br/>
                    • 干预措施协调<br/>
                    • 效果评估统一
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card 
                size="small" 
                title="预期成效理论" 
                style={{ height: '280px', display: 'flex', flexDirection: 'column' }}
                bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <div style={{ textAlign: 'center', fontSize: '12px', lineHeight: '1.6' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1890ff' }}>
                    阶段性成效指标
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>短期（1-2个月）：</strong><br/>
                    基础指标改善30-50%<br/>
                    行为习惯初步建立
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>中期（3-6个月）：</strong><br/>
                    核心指标达标60-80%<br/>
                    健康管理常态化
                  </div>
                  <div>
                    <strong>长期（6-12个月）：</strong><br/>
                    综合健康水平提升<br/>
                    自我管理能力增强
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card 
                size="small" 
                title="追踪阶段" 
                style={{ height: '280px', display: 'flex', flexDirection: 'column' }}
                bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <div style={{ textAlign: 'center', fontSize: '12px', lineHeight: '1.6' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1890ff' }}>
                    持续监测与优化
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>定期监测：</strong><br/>
                    • 每周指标数据收集<br/>
                    • 每月效果评估<br/>
                    • 季度方案调整
                  </div>
                  <div>
                    <strong>优化机制：</strong><br/>
                    • AI智能分析<br/>
                    • 专家团队指导<br/>
                    • 个性化调整
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      );
    } else {
      return (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Title level={4}>方案详情</Title>
            <Alert
              message="请选择一个方案查看详细信息"
              description="点击方案对比中的任意方案卡片，即可查看该方案的详细流程图和执行指南"
              type="info"
              showIcon
            />
          </div>
        </div>
      );
    }
  };

  // 独立的方案详情页面组件
  const renderPlanDetailPage = () => {
    if (!showPlanDetail || !selectedPlanForDetail) {
      return null;
    }

    const plan = selectedPlanForDetail;
    
    return (
      <div>
        {/* 返回按钮和页面标题 */}
        <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => {
                setShowPlanDetail(false);
                setSelectedPlanForDetail(null);
                message.success('已返回方案页面');
              }}
              style={{ marginRight: 16 }}
            >
              返回方案页面
            </Button>
            <Title level={3} style={{ margin: 0 }}>
              {plan.plan_name} - 详细流程图
            </Title>
          </div>
        </div>

        {/* 方案详情内容 */}
        <div>
          <div style={{ marginBottom: 16 }}>
            <Alert
              message={`当前查看：${plan.plan_name}`}
              description={plan.description}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />
          </div>
          
          {/* 两列布局：左侧流程图，右侧关键指标 */}
          <Row gutter={[24, 16]} style={{ marginBottom: '24px' }}>
            <Col span={16}>
              <MermaidFlowchart 
                mermaidCode={plan.flowchartData.mermaid}
                title={plan.flowchartData.title}
              />
            </Col>
            <Col span={8}>
              <Card 
                title="方案执行关键指标" 
                size="small"
                style={{ 
                  height: '1025px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                bodyStyle={{ 
                  padding: '16px',
                  flex: 1,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <div style={{ 
                  flex: 1, 
                  overflowY: 'auto',
                  paddingRight: '8px'
                }}>
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ 
                      fontWeight: 'bold', 
                      color: '#1890ff', 
                      marginBottom: '8px',
                      fontSize: '13px',
                      borderBottom: '1px solid #f0f0f0',
                      paddingBottom: '4px'
                    }}>
                      方案基本信息
                    </div>
                    <div style={{ fontSize: '12px', lineHeight: '1.6' }}>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>难度等级：</strong>{plan.difficulty_level}
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>执行强度：</strong>{plan.execution_intensity}
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>目标时长：</strong>{plan.target_duration}
                      </div>
                      <div style={{ marginBottom: '4px' }}>
                        <strong>总费用：</strong>{plan.total_cost}
                      </div>
                      <div>
                        <strong>框架重点：</strong>{plan.framework_focus}
                      </div>
                    </div>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ 
                      fontWeight: 'bold', 
                      color: '#1890ff', 
                      marginBottom: '8px',
                      fontSize: '13px',
                      borderBottom: '1px solid #f0f0f0',
                      paddingBottom: '4px'
                    }}>
                      预期效果
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px' }}>
                      {plan.expected_outcomes.map((outcome, idx) => (
                        <li key={idx} style={{ marginBottom: '2px' }}>
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ 
                      fontWeight: 'bold', 
                      color: '#1890ff', 
                      marginBottom: '8px',
                      fontSize: '13px',
                      borderBottom: '1px solid #f0f0f0',
                      paddingBottom: '4px'
                    }}>
                      成功指标
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '11px' }}>
                      {plan.success_indicators.map((indicator, idx) => (
                        <li key={idx} style={{ marginBottom: '2px' }}>
                          {indicator}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ 
                    backgroundColor: '#f6ffed', 
                    border: '1px solid #b7eb8f', 
                    borderRadius: '4px', 
                    padding: '8px',
                    fontSize: '11px'
                  }}>
                    <div style={{ fontWeight: 'bold', color: '#52c41a', marginBottom: '4px' }}>
                      执行建议：
                    </div>
                    <div style={{ color: '#666' }}>
                      严格按照流程图执行，定期评估效果，及时调整方案
                    </div>
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
          
          {/* 底部四个信息框 */}
          <Row gutter={[16, 16]} justify="center">
            <Col span={6}>
              <Card 
                size="small" 
                title="理论基础" 
                style={{ height: '280px', display: 'flex', flexDirection: 'column' }}
                bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <div style={{ textAlign: 'center', fontSize: '12px', lineHeight: '1.6' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1890ff' }}>
                    基于C1C2C3框架的整合干预理论
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>适用方案：</strong><br/>
                    {plan.plan_name}
                  </div>
                  <div>
                    <strong>核心原则：</strong><br/>
                    • 多维度健康评估<br/>
                    • 个性化干预策略<br/>
                    • 阶段性效果监测<br/>
                    • 动态方案调整
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card 
                size="small" 
                title="整合机制" 
                style={{ height: '280px', display: 'flex', flexDirection: 'column' }}
                bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <div style={{ textAlign: 'center', fontSize: '12px', lineHeight: '1.6' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1890ff' }}>
                    多系统协同整合
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>系统整合：</strong><br/>
                    • C1睡眠-交感型疲劳系统<br/>
                    • C2代谢风险预警系统<br/>
                    • C3结构性阻力系统
                  </div>
                  <div>
                    <strong>协同机制：</strong><br/>
                    • 数据共享与联动<br/>
                    • 干预措施协调<br/>
                    • 效果评估统一
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card 
                size="small" 
                title="预期成效理论" 
                style={{ height: '280px', display: 'flex', flexDirection: 'column' }}
                bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <div style={{ textAlign: 'center', fontSize: '12px', lineHeight: '1.6' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1890ff' }}>
                    阶段性成效指标
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>短期（1-2个月）：</strong><br/>
                    基础指标改善30-50%<br/>
                    行为习惯初步建立
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>中期（3-6个月）：</strong><br/>
                    核心指标达标60-80%<br/>
                    健康管理常态化
                  </div>
                  <div>
                    <strong>长期（6-12个月）：</strong><br/>
                    综合健康水平提升<br/>
                    自我管理能力增强
                  </div>
                </div>
              </Card>
            </Col>
            <Col span={6}>
              <Card 
                size="small" 
                title="追踪阶段" 
                style={{ height: '280px', display: 'flex', flexDirection: 'column' }}
                bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              >
                <div style={{ textAlign: 'center', fontSize: '12px', lineHeight: '1.6' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#1890ff' }}>
                    持续监测与优化
                  </div>
                  <div style={{ marginBottom: '12px' }}>
                    <strong>定期监测：</strong><br/>
                    • 每周指标数据收集<br/>
                    • 每月效果评估<br/>
                    • 季度方案调整
                  </div>
                  <div>
                    <strong>优化机制：</strong><br/>
                    • AI智能分析<br/>
                    • 专家团队指导<br/>
                    • 个性化调整
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    );
  };

  // 个性化方案菜单数据 - 基于第七阶段要求，包含3个不同执行力度的方案
  const personalizedPlanData = {
    plan_summary: "基于您的IT工作背景、BMI 25.9和压力状况，结合C1C2C3框架分析，为您提供三个不同执行力度和难易程度的健康管理方案",
    client_profile: {
      background: "IT行业，工作强度高，久坐办公",
      health_status: "BMI 25.9（超重），工作压力大，睡眠质量差",
      preferences: "偏好非医疗化语言，数字反馈服务，中高价位产品"
    },
    three_plans: [
      {
        plan_name: "方案一：基础入门型",
        difficulty_level: "简单",
        execution_intensity: "低",
        target_duration: "3个月",
        total_cost: "1800元",
        description: "适合健康管理初学者，以C1睡眠管理为核心，轻量化干预",
        framework_focus: "C1 睡眠-交感型疲劳系统（主）+ C3 结构性阻力系统（辅）",
        modules: [
          {
            module_name: "C1 睡眠-交感型疲劳系统",
            priority: 1,
            services: [
              {
                service_name: "睡眠环境优化套装",
                service_type: "设备服务",
                frequency: "一次性",
                duration: "长期使用",
                cost: "600元",
                convenience: "高",
                customer_preference: "💰 中价位（300–800元）；偏好物理缓解工具",
                company_service_match: "✅ 公司现有产品",
                service_description: "智能睡眠灯、遮光窗帘、白噪音机等环境改善设备"
              },
              {
                service_name: "睡眠习惯指导",
                service_type: "咨询服务",
                frequency: "每周1次",
                duration: "1个月",
                cost: "400元",
                convenience: "中",
                customer_preference: "💰 中价位（300–800元）；偏好自助评估服务",
                company_service_match: "✅ 公司现有产品",
                service_description: "睡眠卫生教育，建立规律作息习惯"
              }
            ]
          },
          {
            module_name: "C3 结构性阻力-行动中断系统",
            priority: 2,
            services: [
              {
                service_name: "时间管理APP",
                service_type: "数字服务",
                frequency: "每日",
                duration: "3个月",
                cost: "200元",
                convenience: "高",
                customer_preference: "💰 低价位（<300元）；偏好数字反馈服务",
                company_service_match: "✅ 公司现有产品",
                service_description: "智能日程管理，健康行为提醒，习惯养成追踪"
              }
            ]
          }
        ],
        expected_outcomes: [
          "睡眠质量评分提升至6分以上",
          "建立规律作息习惯",
          "工作压力感知度降低20%",
          "时间管理效率提升"
        ],
        success_indicators: [
          "入睡时间<30分钟",
          "夜间觉醒次数<2次",
          "晨起疲劳感<6分",
          "日程完成率>70%"
        ],
        flowchartData: {
          title: "方案一：基础入门型流程图",
          mermaid: `graph TD
            A[健康评估开始] --> B{基础健康指标检测}
            B -->|睡眠质量差| C[C1睡眠管理启动]
            B -->|时间管理困难| D[C3时间管理启动]
            
            C --> E[睡眠环境优化]
            C --> F[睡眠习惯建立]
            D --> G[日程规划优化]
            D --> H[健康行为提醒]
            
            E --> I[睡眠质量监测]
            F --> I
            G --> J[执行效率评估]
            H --> J
            
            I --> K{效果评估}
            J --> K
            K -->|达标| L[维持现状]
            K -->|未达标| M[方案调整]
            M --> C
            M --> D
            
            L --> N[3个月总结]
            N --> O[健康习惯巩固]`
        }
      },
      {
        plan_name: "方案二：进阶综合型",
        difficulty_level: "中等",
        execution_intensity: "中",
        target_duration: "6个月",
        total_cost: "4200元",
        description: "适合有一定健康管理基础的用户，C1C2双核心，全面干预",
        framework_focus: "C1 睡眠-交感型疲劳系统 + C2 代谢风险预警系统",
    modules: [
      {
        module_name: "C1 睡眠-交感型疲劳系统",
        priority: 1,
        services: [
          {
            service_name: "HRV压力监测套装",
            service_type: "设备服务",
            frequency: "每日",
            duration: "3个月",
            cost: "1200元",
            convenience: "高",
            customer_preference: "💰 中高价位（500–1500元）；偏好非医疗语言的数字反馈服务",
            company_service_match: "✅ 公司现有产品",
            service_description: "通过心率变异性监测评估压力状态，提供个性化压力管理建议"
          },
          {
            service_name: "睡眠质量改善指导",
            service_type: "咨询服务",
            frequency: "每周1次",
            duration: "2个月",
            cost: "800元",
            convenience: "中",
            customer_preference: "💰 中价位（300–800元）；愿尝试物理缓解工具与自助评估服务",
            company_service_match: "✅ 公司现有产品",
            service_description: "专业睡眠咨询师提供睡眠卫生教育和环境改善建议"
          }
        ]
      },
      {
        module_name: "C2 代谢风险预警系统",
        priority: 2,
        services: [
          {
            service_name: "血糖监测套装",
            service_type: "设备服务",
            frequency: "每周2次",
                duration: "6个月",
            cost: "600元",
            convenience: "高",
            customer_preference: "💰 中高价位（500–1500元）；偏好数字反馈+非诊断化语言",
            company_service_match: "✅ 公司现有产品",
            service_description: "便携式血糖监测设备，配合健康管理APP提供趋势分析"
              },
              {
                service_name: "代谢健康管理指导",
                service_type: "咨询服务",
                frequency: "每两周1次",
                duration: "3个月",
                cost: "1000元",
                convenience: "中",
                customer_preference: "💰 中高价位（500–1500元）；偏好非医疗化语言",
                company_service_match: "✅ 公司现有产品",
                service_description: "营养师指导，个性化饮食方案，运动计划制定"
          }
        ]
      }
    ],
    expected_outcomes: [
      "HRV指标改善至正常范围（>30ms）",
      "睡眠质量评分提升至7分以上",
          "血糖指标稳定在正常范围",
          "BMI下降至25以下",
      "整体疲劳感显著减轻"
    ],
        success_indicators: [
          "空腹血糖<6.1mmol/L",
          "餐后2小时血糖<7.8mmol/L",
          "HRV>30ms",
          "睡眠质量评分>7分",
          "BMI<25"
        ],
        flowchartData: {
          title: "方案二：进阶综合型流程图",
          mermaid: `graph TD
            A[综合健康评估] --> B{多维度健康检测}
            B -->|睡眠+压力问题| C[C1睡眠-交感型疲劳系统]
            B -->|代谢异常风险| D[C2代谢风险预警系统]
            
            C --> E[HRV压力监测]
            C --> F[睡眠质量改善]
            D --> G[血糖监测管理]
            D --> H[代谢健康指导]
            
            E --> I[压力状态分析]
            F --> J[睡眠质量评估]
            G --> K[代谢指标追踪]
            H --> L[营养运动指导]
            
            I --> M[综合效果评估]
            J --> M
            K --> M
            L --> M
            
            M --> N{阶段性评估}
            N -->|达标| O[维持优化]
            N -->|部分达标| P[重点强化]
            N -->|未达标| Q[方案升级]
            
            P --> C
            P --> D
            Q --> R[专业团队介入]
            R --> S[深度干预方案]
            
            O --> T[6个月总结]
            T --> U[健康管理常态化]`
        }
      },
      {
        plan_name: "方案三：专业全面型",
        difficulty_level: "复杂",
        execution_intensity: "高",
        target_duration: "12个月",
        total_cost: "8800元",
        description: "适合追求全面健康管理的用户，C1C2C3三核心，深度干预",
        framework_focus: "C1 睡眠-交感型疲劳系统 + C2 代谢风险预警系统 + C3 结构性阻力系统",
        modules: [
          {
            module_name: "C1 睡眠-交感型疲劳系统",
            priority: 1,
            services: [
              {
                service_name: "高级HRV压力监测系统",
                service_type: "设备服务",
                frequency: "每日",
                duration: "6个月",
                cost: "2000元",
                convenience: "高",
                customer_preference: "💰 高价位（1500–3000元）；偏好非医疗语言的数字反馈服务",
                company_service_match: "✅ 公司现有产品",
                service_description: "多参数生理监测，AI压力分析，个性化恢复建议"
              },
              {
                service_name: "睡眠医学专家咨询",
                service_type: "咨询服务",
                frequency: "每周1次",
                duration: "3个月",
                cost: "1500元",
                convenience: "中",
                customer_preference: "💰 高价位（1500–3000元）；偏好专业指导",
                company_service_match: "✅ 公司现有产品",
                service_description: "睡眠医学专家一对一咨询，深度睡眠问题诊断和干预"
              }
            ]
          },
          {
            module_name: "C2 代谢风险预警系统",
            priority: 2,
            services: [
              {
                service_name: "全面代谢监测系统",
                service_type: "设备服务",
                frequency: "每日",
                duration: "12个月",
                cost: "1800元",
                convenience: "高",
                customer_preference: "💰 高价位（1500–3000元）；偏好数字反馈+非诊断化语言",
                company_service_match: "✅ 公司现有产品",
                service_description: "连续血糖监测，体脂分析，代谢指标追踪"
              },
              {
                service_name: "代谢健康专家团队",
                service_type: "咨询服务",
                frequency: "每周1次",
                duration: "6个月",
                cost: "2000元",
                convenience: "中",
                customer_preference: "💰 高价位（1500–3000元）；偏好专业指导",
                company_service_match: "✅ 公司现有产品",
                service_description: "营养师+运动康复师+内分泌专家团队服务"
              }
            ]
          },
          {
            module_name: "C3 结构性阻力-行动中断系统",
            priority: 3,
            services: [
              {
                service_name: "智能健康管理系统",
                service_type: "数字服务",
                frequency: "每日",
                duration: "12个月",
                cost: "800元",
                convenience: "高",
                customer_preference: "💰 中价位（300–800元）；偏好数字反馈服务",
                company_service_match: "✅ 公司现有产品",
                service_description: "AI健康助手，智能日程优化，行为干预提醒"
              },
              {
                service_name: "健康管理师全程跟踪",
                service_type: "咨询服务",
                frequency: "每周1次",
                duration: "12个月",
                cost: "700元",
                convenience: "中",
                customer_preference: "💰 中价位（300–800元）；偏好专业指导",
                company_service_match: "✅ 公司现有产品",
                service_description: "专属健康管理师，全程跟踪指导，个性化方案调整"
              }
            ]
          }
        ],
        expected_outcomes: [
          "HRV指标稳定在优秀范围（>40ms）",
          "睡眠质量评分达到8分以上",
          "所有代谢指标达到理想范围",
          "BMI降至23-24正常范围",
          "工作压力管理能力显著提升",
          "建立可持续的健康生活方式"
        ],
        success_indicators: [
          "空腹血糖<5.6mmol/L",
          "餐后2小时血糖<6.7mmol/L",
          "HbA1c<5.5%",
          "HRV>40ms",
          "睡眠质量评分>8分",
          "BMI 23-24",
          "工作压力评分<3分"
        ],
        flowchartData: {
          title: "方案三：专业全面型流程图",
          mermaid: `graph TD
            A[全面健康评估] --> B{深度健康分析}
            B -->|睡眠+压力+代谢+结构| C[C1C2C3三系统联动]
            
            C --> D[C1睡眠-交感型疲劳系统]
            C --> E[C2代谢风险预警系统]
            C --> F[C3结构性阻力系统]
            
            D --> G[高级HRV监测]
            D --> H[睡眠医学专家咨询]
            E --> I[全面代谢监测]
            E --> J[代谢健康专家团队]
            F --> K[智能健康管理系统]
            F --> L[健康管理师全程跟踪]
            
            G --> M[多参数生理分析]
            H --> N[深度睡眠诊断]
            I --> O[连续代谢追踪]
            J --> P[多学科团队服务]
            K --> Q[AI健康助手]
            L --> R[个性化方案调整]
            
            M --> S[综合健康评估]
            N --> S
            O --> S
            P --> S
            Q --> S
            R --> S
            
            S --> T{多维度效果评估}
            T -->|优秀| U[维持优化]
            T -->|良好| V[微调优化]
            T -->|一般| W[重点强化]
            T -->|较差| X[方案重构]
            
            V --> C
            W --> Y[专家会诊]
            X --> Z[重新评估]
            Y --> C
            Z --> A
            
            U --> AA[12个月总结]
            AA --> BB[健康管理专家化]`
        }
      }
    ],
    reasoning_logic: "基于您的IT工作背景、BMI 25.9超重状况和工作压力，结合C1C2C3框架分析：C1睡眠-交感型疲劳系统是核心问题，C2代谢风险预警系统是重要风险，C3结构性阻力系统是执行障碍。三个方案分别针对不同执行能力和需求层次。",
    monitoring_plan: [
      "每周健康指标数据评估",
      "每月专家咨询和方案调整",
      "季度综合健康评估报告",
      "半年期深度健康体检",
      "年度健康管理效果总结"
    ]
  };

  const renderPersonalizedPlanMenu = () => (
    <div>

      {/* 客户健康简历 */}
      <Card 
        title="客户健康简历" 
        style={{ marginBottom: 24 }}
        extra={
          <Button 
            type="primary" 
            size="small"
            icon={<UserOutlined />}
            onClick={() => {
              setCurrentStep(2);
              setHealthResume(healthResume || mockHealthResume);
              message.success('已跳转到健康简历详情页面');
            }}
          >
            详情
          </Button>
        }
      >
        <Row gutter={[16, 16]}>
          <Col span={24}>
            <Card size="small" title="基本信息">
              <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                李明远，42岁，男性，IT工程师
              </div>
            </Card>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={8}>
            <Card size="small" title="身体健康">
              <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                {healthResume?.overview?.physical || "体重75kg，BMI24.5，血压125/80 mmHg；长期保持规律运动和均衡饮食，作息稳定；腰椎间盘突出史，儿童期哮喘已控制。"}
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="心理与压力">
              <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                {healthResume?.overview?.psychological || "偶尔焦虑，压力评分7/10；通过CBT心理咨询、冥想及规律运动缓解压力。"}
              </div>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="生活方式">
              <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                {healthResume?.overview?.lifestyle || "固定作息22:45-7:00，每周跑步3次，周末骑行/羽毛球，高蛋白低碳水饮食，夜间电子设备受控；热衷科技、阅读和公益活动。"}
              </div>
            </Card>
          </Col>
        </Row>
        <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
          <Col span={12}>
            <Card size="small" title="家庭与社交">
              <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                {healthResume?.overview?.social || "配偶共同运动和监督饮食，父母健康状况关注中；朋友社群活跃，线上心理辅导平台参与中。"}
              </div>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="健康目标">
              <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                {healthResume?.overview?.goals || "短期维持体重75kg、睡眠7.5h/晚、心理压力中等以下；长期体脂<20%，运动与心理习惯常态化"}
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 三个方案对比 */}
      <Card title="三个方案对比" style={{ marginBottom: 24 }}>
        <Paragraph style={{ fontSize: '16px', lineHeight: '1.8', marginBottom: 16, color: '#666' }}>
          {personalizedPlanData.plan_summary}
        </Paragraph>
        <Row gutter={[16, 16]}>
          {personalizedPlanData.three_plans.map((plan, index) => (
            <Col span={8} key={index}>
              <Card
                title={
                  <div style={{ textAlign: 'center' }}>
                    <Text strong style={{ fontSize: '16px' }}>{plan.plan_name}</Text>
                  </div>
                }
                style={{ 
                  height: '100%',
                  border: index === selectedPlanIndex ? '2px solid #1890ff' : '1px solid #d9d9d9',
                  position: 'relative',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  setSelectedPlanIndex(index);
                  message.success(`已选择${plan.plan_name}`);
                }}
                bodyStyle={{ padding: '16px' }}
              >
                {index === selectedPlanIndex && (
                  <div style={{
                    position: 'absolute',
                    top: '-8px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#1890ff',
                    color: 'white',
                    padding: '2px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    推荐方案
                  </div>
                )}
                
                <div style={{ marginBottom: '16px', textAlign: 'center' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <Tag color={index === 0 ? 'green' : index === 1 ? 'blue' : 'red'}>
                      难度：{plan.difficulty_level}
                    </Tag>
                    <Tag color={index === 0 ? 'green' : index === 1 ? 'blue' : 'red'}>
                      执行强度：{plan.execution_intensity}
                    </Tag>
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff', marginBottom: '8px' }}>
                    {plan.total_cost}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                    {plan.target_duration}
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <Text strong>方案描述：</Text>
                  <div style={{ marginTop: '4px', fontSize: '13px', color: '#666' }}>
                    {plan.description}
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <Text strong>框架重点：</Text>
                  <div style={{ marginTop: '4px', fontSize: '13px', color: '#1890ff' }}>
                    {plan.framework_focus}
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <Text strong>预期效果：</Text>
                  <ul style={{ paddingLeft: '16px', margin: '4px 0 0 0', fontSize: '12px' }}>
                    {plan.expected_outcomes.slice(0, 2).map((outcome, idx) => (
                      <li key={idx} style={{ marginBottom: '2px' }}>{outcome}</li>
                    ))}
                    {plan.expected_outcomes.length > 2 && (
                      <li style={{ color: '#666' }}>...等{plan.expected_outcomes.length}项指标</li>
                    )}
                  </ul>
                </div>

                <div style={{ textAlign: 'center', marginTop: '16px' }}>
                  <Button 
                    type={index === selectedPlanIndex ? 'primary' : 'default'}
                    size="small"
                    style={{ width: '100%' }}
                    onClick={(e) => {
                      e.stopPropagation(); // 阻止事件冒泡，避免触发卡片的onClick
                      setSelectedPlanForDetail(plan);
                      setShowPlanDetail(true);
                      message.success(`已进入${plan.plan_name}详情页面`);
                    }}
                  >
                    查看详情
                  </Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 推荐方案详情（动态显示选中的方案） */}
      <Card title={`推荐方案详情：${personalizedPlanData.three_plans[selectedPlanIndex].plan_name}`} style={{ marginBottom: 24 }}>
        <Alert
          message={`基于您的IT工作背景和健康需求，推荐此方案`}
          description={personalizedPlanData.three_plans[selectedPlanIndex].description}
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />

      {/* 模块化服务方案 */}
      <Row gutter={[24, 24]}>
          {personalizedPlanData.three_plans[selectedPlanIndex].modules.map((module, index) => (
          <Col span={24} key={index}>
            <Card
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <Text strong style={{ fontSize: '16px' }}>{module.module_name}</Text>
                    <Tag color="blue" style={{ marginLeft: 12 }}>优先级: {module.priority}</Tag>
                  </div>
                  <Tag color="green">推荐方案</Tag>
                </div>
              }
              style={{ marginBottom: 16 }}
            >
              <Row gutter={[16, 16]}>
                {module.services.map((service, serviceIndex) => (
                  <Col span={24} key={serviceIndex}>
                    <Card 
                      size="small" 
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text strong>{service.service_name}</Text>
                          <Space>
                            <Tag color="green">{service.company_service_match}</Tag>
                            <Tag color="blue">{service.service_type}</Tag>
                          </Space>
                        </div>
                      }
                      style={{ marginBottom: 12 }}
                    >
                      <Row gutter={[16, 8]}>
                        <Col span={12}>
                          <div style={{ marginBottom: 8 }}>
                            <Text strong>服务描述：</Text>
                            <div style={{ marginTop: 4, color: '#666' }}>
                              {service.service_description}
                            </div>
                          </div>
                          <div style={{ marginBottom: 8 }}>
                            <Text strong>客户偏好匹配：</Text>
                            <div style={{ marginTop: 4, color: '#1890ff' }}>
                              {service.customer_preference}
                            </div>
                          </div>
                        </Col>
                        <Col span={12}>
                          <div style={{ marginBottom: 8 }}>
                            <Text strong>服务详情：</Text>
                            <div style={{ marginTop: 4 }}>
                              <div>📅 频率：{service.frequency}</div>
                              <div>⏱️ 时长：{service.duration}</div>
                              <div>💰 费用：{service.cost}</div>
                              <div>🚀 便利性：{service.convenience}</div>
                            </div>
                          </div>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        ))}
      </Row>

        {/* 预期效果和成功指标 */}
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card size="small" title="预期效果">
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                {personalizedPlanData.three_plans[selectedPlanIndex].expected_outcomes.map((outcome, index) => (
                  <li key={index} style={{ marginBottom: '8px' }}>{outcome}</li>
                ))}
              </ul>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="成功指标">
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                {personalizedPlanData.three_plans[selectedPlanIndex].success_indicators.map((indicator, index) => (
                  <li key={index} style={{ marginBottom: '8px' }}>{indicator}</li>
                ))}
              </ul>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 综合落地推理逻辑 */}
      <Card title="综合落地推理逻辑" style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <Text strong>推理过程：</Text>
          <div style={{ marginTop: 8, padding: 16, background: '#f6ffed', borderRadius: 6, border: '1px solid #b7eb8f' }}>
            {personalizedPlanData.reasoning_logic}
                </div>
              </div>
        
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <Card size="small" title="监测计划">
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                {personalizedPlanData.monitoring_plan.map((plan, index) => (
                  <li key={index} style={{ marginBottom: '8px' }}>{plan}</li>
                ))}
              </ul>
            </Card>
          </Col>
          <Col span={12}>
            <Card size="small" title="方案选择建议">
              <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
                <div style={{ marginBottom: '8px' }}>
                  <strong>方案一：</strong>适合健康管理初学者，预算有限，时间紧张
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <strong>方案二：</strong>适合有一定基础，追求平衡效果的用户（推荐）
              </div>
              <div>
                  <strong>方案三：</strong>适合追求全面健康管理，预算充足，时间充裕
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );

  const renderFrameworkTreeStructure = () => (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={4}>树形理论解决方案</Title>
        <Alert
          message="方案设计原则"
          description="基于科学验证的理论框架，不涉及具体产品服务，仅构建解决路径"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      </div>

      <Row gutter={[24, 24]}>
        {solutionTrees.map(solution => (
          <Col span={24} key={solution.key}>
            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div 
                    style={{ 
                      width: '12px', 
                      height: '12px', 
                      backgroundColor: solution.color, 
                      borderRadius: '50%' 
                    }} 
                  />
                  <span>{solution.title}</span>
                </div>
              }
              style={{ marginBottom: 16 }}
              extra={
                <Tag color="blue">{solution.applicableModule}</Tag>
              }
            >
              <div style={{ marginBottom: 16 }}>
                <Paragraph>
                  <strong>理论基础：</strong>{solution.description}
                </Paragraph>
                <Paragraph>
                  <strong>根节点：</strong>{solution.rootNode}
                </Paragraph>
              </div>
              
              <Tree
                treeData={[
                  {
                    key: solution.key,
                    title: solution.rootNode,
                    children: solution.children.map(branch => ({
                      key: branch.key,
                      title: branch.title,
                      children: branch.children.map(item => ({
                        key: item.key,
                        title: (
                          <div>
                            <div style={{ fontWeight: 'bold' }}>{item.title}</div>
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                              {item.description}
                            </div>
                          </div>
                        )
                      }))
                    }))
                  }
                ]}
                defaultExpandAll
                showLine={{ showLeafIcon: false }}
                style={{ 
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}
                titleRender={(nodeData) => (
                  <div style={{ padding: '4px 0' }}>
                    <div style={{ fontWeight: 'bold', color: '#1890ff' }}>
                      {nodeData.title}
                    </div>
                    {nodeData.description && (
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        {nodeData.description}
                      </div>
                    )}
                  </div>
                )}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 三方案整合逻辑 */}
      <Card title="三方案整合逻辑" style={{ marginTop: 24 }}>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Card size="small" title="协同效应">
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                <li><strong>方案1+2：</strong>药物症状控制为生活方式改变创造条件</li>
                <li><strong>方案2+3：</strong>戒烟与生活方式改变相互促进</li>
                <li><strong>方案1+3：</strong>戒烟直接减少病理损害</li>
              </ul>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="实施顺序建议">
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                <li>基础干预并行启动</li>
                <li>优先发挥方案1的疗效</li>
                <li>症状改善后逐步深化方案2、3</li>
              </ul>
            </Card>
          </Col>
          <Col span={8}>
            <Card size="small" title="效果叠加预期">
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                <li><strong>单一方案：</strong>症状改善率30-40%</li>
                <li><strong>两方案组合：</strong>症状改善率50-60%</li>
                <li><strong>三方案整合：</strong>症状改善率70-80%</li>
              </ul>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );

  const renderFrameworkIndicators = () => (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Title level={4}>模块指标量化</Title>
        <Alert
          message="指标量化说明"
          description="每个模块的核心作用机理和评估指标都是可量化的，便于效果评估。"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
      </div>
      
      <style jsx>{`
        .table-row-light {
          background-color: #fafafa;
        }
        .table-row-dark {
          background-color: #ffffff;
        }
        .ant-table-tbody > tr > td {
          vertical-align: top !important;
          padding: 12px 8px !important;
        }
        .ant-table-thead > tr > th {
          background-color: #f5f5f5 !important;
          font-weight: 600 !important;
        }
      `}</style>

      <Collapse defaultActiveKey={['1']}>
        {frameworkModules.map(module => (
          <Panel 
            header={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text strong>{module.name}</Text>
                <Space>
                  <Tag color="blue">{module.category}</Tag>
                  <Tag color="green">置信度: {module.confidence}%</Tag>
                </Space>
              </div>
            } 
            key={module.id}
          >
            <Table
              dataSource={module.indicators}
              columns={[
                {
                  title: '指标名称',
                  dataIndex: 'name',
                  key: 'name',
                  width: 120
                },
                {
                  title: '目标值',
                  dataIndex: 'target',
                  key: 'target',
                  width: 100,
                  render: (text) => <Tag color="green">{text}</Tag>
                },
                {
                  title: '当前值',
                  dataIndex: 'current',
                  key: 'current',
                  width: 100,
                  render: (text) => <Tag color="orange">{text}</Tag>
                },
                {
                  title: '单位',
                  dataIndex: 'unit',
                  key: 'unit',
                  width: 80
                },
                {
                  title: '需求评估来源',
                  dataIndex: 'sources',
                  key: 'sources',
                  width: 300,
                  render: (sources) => (
                    <div style={{ fontSize: '11px', color: '#666', maxWidth: '280px', lineHeight: '1.4' }}>
                      {sources && sources.length > 0 ? (
                        <div>
                          <div style={{ 
                            fontWeight: 'bold', 
                            marginBottom: '8px', 
                            color: '#1890ff',
                            fontSize: '12px',
                            borderBottom: '1px solid #e8e8e8',
                            paddingBottom: '4px'
                          }}>
                            合并条目 ({sources.length}个)
                          </div>
                          <div style={{ maxHeight: '120px', overflowY: 'auto' }}>
                            {sources.map((source, idx) => (
                              <div key={idx} style={{ 
                                marginBottom: '8px', 
                                padding: '6px 8px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '4px',
                                border: '1px solid #e9ecef',
                                fontSize: '10px',
                                lineHeight: '1.3'
                              }}>
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'flex-start',
                                  gap: '6px'
                                }}>
                                  <div style={{ 
                                    color: '#1890ff', 
                                    fontWeight: 'bold',
                                    minWidth: '12px',
                                    marginTop: '1px'
                                  }}>
                                    {idx + 1}.
                                  </div>
                                  <div style={{ flex: 1, wordBreak: 'break-word' }}>
                                    {source}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div style={{ 
                          color: '#999', 
                          fontStyle: 'italic',
                          textAlign: 'center',
                          padding: '20px'
                        }}>
                          待获取
                        </div>
                      )}
                    </div>
                  )
                },
                {
                  title: '状态',
                  key: 'status',
                  width: 80,
                  render: (_, record) => {
                    const isTargetMet = record.current === record.target;
                    return (
                      <Tag color={isTargetMet ? 'success' : 'warning'}>
                        {isTargetMet ? '达标' : '未达标'}
                      </Tag>
                    );
                  }
                }
              ]}
              pagination={false}
              size="small"
              scroll={{ x: 800 }}
              rowClassName={(record, index) => index % 2 === 0 ? 'table-row-light' : 'table-row-dark'}
            />
          </Panel>
        ))}
      </Collapse>
    </div>
  );

  // 框架构建内容组件
  const FrameworkConstructionContent = () => (
    <div>
      <Tabs 
        activeKey={frameworkActiveTab} 
        onChange={setFrameworkActiveTab}
        items={[
          {
            key: 'modules',
            label: (
              <span>
                <AppstoreOutlined />
                模块管理
              </span>
            ),
            children: renderFrameworkModuleList()
          },
          {
            key: 'flowchart',
            label: (
              <span>
                <NodeIndexOutlined />
                流程图
              </span>
            ),
            children: renderFlowchartStructure()
          },
          {
            key: 'indicators',
            label: (
              <span>
                <BarChartOutlined />
                指标量化
              </span>
            ),
            children: renderFrameworkIndicators()
          }
        ]}
      />

      {/* 添加模块模态框 */}
      <Modal
        title="添加新模块"
        open={isAddingModule}
        onCancel={() => setIsAddingModule(false)}
        onOk={() => frameworkForm.submit()}
        width={600}
      >
        <Form form={frameworkForm} onFinish={handleAddModule} layout="vertical">
          <Form.Item name="name" label="模块名称" rules={[{ required: true }]}>
            <Input placeholder="请输入模块名称" />
          </Form.Item>
          
          <Form.Item name="description" label="模块描述" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="请输入模块描述" />
          </Form.Item>
          
          <Form.Item name="category" label="分类" rules={[{ required: true }]}>
            <Select placeholder="请选择分类">
              <Option value="生理健康">生理健康</Option>
              <Option value="心理健康">心理健康</Option>
              <Option value="社会健康">社会健康</Option>
              <Option value="环境健康">环境健康</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="priority" label="优先级" rules={[{ required: true }]}>
            <Select placeholder="请选择优先级">
              <Option value={1}>1 - 最高</Option>
              <Option value={2}>2 - 高</Option>
              <Option value={3}>3 - 中</Option>
              <Option value={4}>4 - 低</Option>
              <Option value={5}>5 - 最低</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑模块模态框 */}
      <Modal
        title="编辑模块"
        open={isEditingModule}
        onCancel={() => {
          setIsEditingModule(false);
          setSelectedModule(null);
          moduleForm.resetFields();
        }}
        onOk={() => moduleForm.submit()}
        width={600}
      >
        <Form form={moduleForm} onFinish={handleEditModule} layout="vertical">
          <Form.Item name="name" label="模块名称" rules={[{ required: true }]}>
            <Input placeholder="请输入模块名称" />
          </Form.Item>
          
          <Form.Item name="description" label="模块描述" rules={[{ required: true }]}>
            <TextArea rows={3} placeholder="请输入模块描述" />
          </Form.Item>
          
          <Form.Item name="category" label="分类" rules={[{ required: true }]}>
            <Select placeholder="请选择分类">
              <Option value="生理健康">生理健康</Option>
              <Option value="心理健康">心理健康</Option>
              <Option value="社会健康">社会健康</Option>
              <Option value="环境健康">环境健康</Option>
            </Select>
          </Form.Item>
          
          <Form.Item name="priority" label="优先级" rules={[{ required: true }]}>
            <Select placeholder="请选择优先级">
              <Option value={1}>1 - 最高</Option>
              <Option value={2}>2 - 高</Option>
              <Option value={3}>3 - 中</Option>
              <Option value={4}>4 - 低</Option>
              <Option value={5}>5 - 最低</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 模块详情抽屉 */}
      <Drawer
        title={selectedModule?.name}
        placement="right"
        width={600}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
      >
        {selectedModule && (
          <div>
            <Card size="small" title="基本信息" style={{ marginBottom: 16 }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>描述：</Text>
                  <Paragraph>{selectedModule.description}</Paragraph>
                </div>
                <div>
                  <Text strong>分类：</Text>
                  <Tag color="blue">{selectedModule.category}</Tag>
                </div>
                <div>
                  <Text strong>优先级：</Text>
                  <Tag color="green">{selectedModule.priority}</Tag>
                </div>
                <div>
                  <Text strong>置信度：</Text>
                  <Progress percent={selectedModule.confidence} size="small" />
                </div>
              </Space>
            </Card>

            <Card size="small" title="关键指标" style={{ marginBottom: 16 }}>
              <List
                dataSource={selectedModule.indicators}
                renderItem={item => (
                  <List.Item>
                    <div style={{ width: '100%' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <Space>
                          <Text strong>{item.name}</Text>
                          <Text type="secondary">目标: {item.target}</Text>
                          <Text type="secondary">当前: {item.current}</Text>
                          <Text type="secondary">{item.unit}</Text>
                        </Space>
                      </div>
                      {item.sources && item.sources.length > 0 && (
                        <div style={{ 
                          fontSize: '11px', 
                          color: '#1890ff', 
                          backgroundColor: '#f0f8ff', 
                          padding: '12px', 
                          borderRadius: '6px',
                          border: '1px solid #d6e4ff',
                          marginTop: '8px'
                        }}>
                          <div style={{ 
                            fontWeight: 'bold', 
                            marginBottom: '8px', 
                            color: '#1890ff',
                            fontSize: '12px',
                            borderBottom: '1px solid #d6e4ff',
                            paddingBottom: '4px'
                          }}>
                            合并的需求评估条目 ({item.sources.length}个)
                          </div>
                          <div style={{ maxHeight: '150px', overflowY: 'auto' }}>
                            {item.sources.map((source, idx) => (
                              <div key={idx} style={{ 
                                marginBottom: '8px', 
                                padding: '6px 8px',
                                backgroundColor: '#ffffff',
                                borderRadius: '4px',
                                border: '1px solid #e9ecef',
                                fontSize: '10px',
                                lineHeight: '1.4'
                              }}>
                                <div style={{ 
                                  display: 'flex', 
                                  alignItems: 'flex-start',
                                  gap: '6px'
                                }}>
                                  <div style={{ 
                                    color: '#1890ff', 
                                    fontWeight: 'bold',
                                    minWidth: '16px',
                                    marginTop: '1px'
                                  }}>
                                    {idx + 1}.
                                  </div>
                                  <div style={{ flex: 1, wordBreak: 'break-word' }}>
                                    {source}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            </Card>

            <Card size="small" title="需求列表" style={{ marginBottom: 16 }}>
              <List
                dataSource={selectedModule.requirements}
                renderItem={item => (
                  <List.Item>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                    {item}
                  </List.Item>
                )}
              />
            </Card>

            <Card size="small" title="干预措施">
              <List
                dataSource={selectedModule.interventions}
                renderItem={item => (
                  <List.Item>
                    <ThunderboltOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                    {item}
                  </List.Item>
                )}
              />
            </Card>
          </div>
        )}
      </Drawer>
    </div>
  );

  const renderOverview = () => (
    <Card title="健康简历概览" style={{ marginBottom: 24 }}>
      <Row gutter={[24, 24]}>
        <Col span={24}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: '48px', marginBottom: 16 }}>{healthResume.basicInfo.avatar}</div>
            <Title level={2}>{healthResume.basicInfo.name}</Title>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              {healthResume.basicInfo.age}岁 · {healthResume.basicInfo.location} · {healthResume.basicInfo.occupation}
            </Text>
          </div>
        </Col>
        
        <Col span={12}>
          <Card size="small" title="身体健康" style={{ height: '100%' }}>
            <Paragraph>{healthResume.overview.physical}</Paragraph>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card size="small" title="心理状态" style={{ height: '100%' }}>
            <Paragraph>{healthResume.overview.psychological}</Paragraph>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card size="small" title="生活方式" style={{ height: '100%' }}>
            <Paragraph>{healthResume.overview.lifestyle}</Paragraph>
          </Card>
        </Col>
        
        <Col span={12}>
          <Card size="small" title="社交支持" style={{ height: '100%' }}>
            <Paragraph>{healthResume.overview.social}</Paragraph>
          </Card>
        </Col>
        
        <Col span={24}>
          <Card size="small" title="重大事件">
            <Space wrap>
              {healthResume.overview.majorEvents.map((event, index) => (
                <Tag key={index} color="blue">{event}</Tag>
              ))}
            </Space>
          </Card>
        </Col>
        
        <Col span={24}>
          <Card size="small" title="健康目标">
            <Paragraph>{healthResume.overview.goals}</Paragraph>
          </Card>
        </Col>
      </Row>
    </Card>
  );

  const renderThemeDetail = (themeKey) => {
    const theme = healthResume.themes[themeKey];
    if (!theme) return null;

    return (
      <Card title={theme.title} style={{ marginBottom: 24 }}>
        <Row gutter={[24, 24]}>
          <Col span={24}>
            <Title level={4}>概览</Title>
            <Paragraph>{theme.overview}</Paragraph>
          </Col>
          
          <Col span={24}>
            <Title level={4}>时间序列</Title>
            <Timeline
              items={theme.timeline.map((item, index) => ({
                dot: <CalendarOutlined style={{ color: '#1890ff' }} />,
                children: (
                  <div>
                    <Text strong style={{ color: '#1890ff' }}>{item.year}</Text>
                    <br />
                    <Text strong>{item.event}</Text>
                    <br />
                    <Text type="secondary">{item.details}</Text>
                    <Tag color={getEventTypeColor(item.type)} style={{ marginLeft: 8 }}>
                      {item.type}
                    </Tag>
                  </div>
                )
              }))}
            />
          </Col>
          
          {theme.interventions && (
            <Col span={12}>
              <Title level={4}>干预措施</Title>
              <Space wrap>
                {theme.interventions.map((intervention, index) => (
                  <Tag key={index} color="green">{intervention}</Tag>
                ))}
              </Space>
            </Col>
          )}
          
          {theme.interests && (
            <Col span={12}>
              <Title level={4}>兴趣爱好</Title>
              <Space wrap>
                {theme.interests.map((interest, index) => (
                  <Tag key={index} color="purple">{interest}</Tag>
                ))}
              </Space>
            </Col>
          )}
          
          {theme.support && (
            <Col span={12}>
              <Title level={4}>支持系统</Title>
              <Space wrap>
                {theme.support.map((support, index) => (
                  <Tag key={index} color="orange">{support}</Tag>
                ))}
              </Space>
            </Col>
          )}
        </Row>
      </Card>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#001529', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            🚀 健康数字人框架demo
          </Title>
        </div>
      </Header>

      <Layout>
        <Sider width={300} style={{ background: '#fff', borderRight: '1px solid #f0f0f0' }}>
          <div style={{ padding: '16px' }}>
            <Title level={4} style={{ marginBottom: '16px' }}>主要处理流程</Title>
            {(() => {
              console.log('📋 渲染菜单，当前选中:', selectedMenu);
              console.log('📋 菜单数据:', stageMenus);
              return null;
            })()}
            <Menu
              mode="inline"
              selectedKeys={[selectedMenu]}
              style={{ border: 'none' }}
              items={stageMenus.map(menu => ({
                key: menu.key,
                icon: menu.icon,
                label: menu.title
              }))}
              onClick={({ key }) => {
                console.log('🖱️ 菜单点击:', key);
                setSelectedMenu(key);
              }}
            />
          </div>
        </Sider>

        <Content style={{ padding: '24px' }}>
          {/* 方案详情页面 - 独立显示 */}
          {showPlanDetail && renderPlanDetailPage()}
          
          {/* 根据选中的菜单显示不同内容 */}
          {!showPlanDetail && (() => {
            console.log('🎯 渲染内容，当前选中菜单:', selectedMenu);
            console.log('🎯 框架构建标签页:', frameworkActiveTab);
            return null;
          })()}
          {!showPlanDetail && selectedMenu === 'stage1' && (
            <div>
              {/* 数据采集 */}
              <Card title="多模态数据解析" style={{ marginBottom: 24 }}>
                <Paragraph>
                  第一阶段：本步负责接收并处理多种格式的健康数据（音频、视频、文档、图片等），
                  通过AI技术进行智能解析和内容提取，构建或更新"健康简历"。
                </Paragraph>
                <Paragraph>
                  本阶段模型主要作用：多模态信息识别、解析、整合，完成健康简历的创建和更新。注重信息完整性和准确性。
                </Paragraph>
              </Card>

              {/* 步骤指示器 */}
              <Card style={{ marginBottom: 24 }}>
                <Steps current={currentStep} items={steps} />
              </Card>

              {/* 多模态数据采集 */}
              {currentStep === 0 && (
                <div>
                  {/* 数据源选择标签页 */}
                  <Card 
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ThunderboltOutlined style={{ color: '#1890ff' }} />
                        <span>多模态健康数据采集</span>
                        <Tag color="blue" style={{ marginLeft: 'auto' }}>
                          智能融合分析
                        </Tag>
                      </div>
                    }
                    style={{ marginBottom: 24 }}
                  >
                    <Tabs 
                      activeKey={activeDataSource} 
                      onChange={setActiveDataSource}
                      items={[
                        {
                          key: 'files',
                          label: (
                            <span>
                              <CloudUploadOutlined />
                              文件上传
                            </span>
                          ),
                          children: renderFileUploadSection()
                        },
                        {
                          key: 'api',
                          label: (
                            <span>
                              <ApiOutlined />
                              接口接入
                            </span>
                          ),
                          children: renderApiConnectionSection()
                        },
                        {
                          key: 'manual',
                          label: (
                            <span>
                              <FormOutlined />
                              手动录入
                            </span>
                          ),
                          children: renderManualInputSection()
                        },
                        {
                          key: 'realtime',
                          label: (
                            <span>
                              <SyncIcon />
                              实时同步
                            </span>
                          ),
                          children: renderRealtimeSyncSection()
                        }
                      ]}
                    />
                  </Card>

                  {/* 数据采集进度 */}
                  {dataCollectionProgress > 0 && (
                    <Card title="数据采集进度" style={{ marginBottom: 24 }}>
                      <Progress 
                        percent={dataCollectionProgress} 
                        status={dataCollectionProgress === 100 ? 'success' : 'active'}
                        strokeColor={{
                          '0%': '#108ee9',
                          '100%': '#87d068',
                        }}
                      />
                      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary">已采集数据源: {uploadedFiles.length + apiConnections.length}</Text>
                        <Text type="secondary">数据完整性: {dataCollectionProgress}%</Text>
                      </div>
                    </Card>
                  )}

                  {/* 已采集数据预览 */}
                  {(uploadedFiles.length > 0 || apiConnections.length > 0) && (
                    <Card title="已采集数据预览" style={{ marginBottom: 24 }}>
                      <Row gutter={[16, 16]}>
                        {uploadedFiles.map((file, index) => (
                          <Col span={8} key={index}>
                            <Card size="small" hoverable>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {getFileIcon(file.type)}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <Text strong ellipsis>{file.name}</Text>
                                  <br />
                                  <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {formatFileSize(file.size)}
                                  </Text>
                                </div>
                                <Button 
                                  type="text" 
                                  size="small" 
                                  icon={<DeleteOutlined />}
                                  onClick={() => removeFile(index)}
                                />
                              </div>
                            </Card>
                          </Col>
                        ))}
                        {apiConnections.map((connection, index) => (
                          <Col span={8} key={`api-${index}`}>
                            <Card size="small" hoverable>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <DatabaseOutlined style={{ color: '#52c41a' }} />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <Text strong ellipsis>{connection.name}</Text>
                                  <br />
                                  <Text type="secondary" style={{ fontSize: '12px' }}>
                                    最后同步: {connection.lastSync}
                                  </Text>
                                </div>
                                <Button 
                                  type="text" 
                                  size="small" 
                                  icon={<SyncIcon />}
                                  onClick={() => syncApiData(index)}
                                />
                              </div>
                            </Card>
                          </Col>
                        ))}
                      </Row>
                    </Card>
                  )}

                  {/* 开始分析按钮 */}
                  <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <Button 
                      type="primary" 
                      size="large"
                      icon={<SearchOutlined />}
                      onClick={startDataAnalysis}
                      disabled={uploadedFiles.length === 0 && apiConnections.length === 0}
                      style={{ 
                        height: '48px', 
                        paddingLeft: '32px', 
                        paddingRight: '32px',
                        fontSize: '16px',
                        borderRadius: '24px'
                      }}
                    >
                      开始智能分析
                    </Button>
                  </div>
                </div>
              )}

        {/* 解析步骤 */}
        {currentStep === 1 && (
          <div>
            {/* 进度条 */}
            {!analysisCompleted && (
              <Card title="AI解析中..." style={{ textAlign: 'center', marginBottom: 24 }}>
                <Progress 
                  percent={analysisProgress} 
                  status={analysisProgress === 100 ? 'success' : 'active'}
                  style={{ marginBottom: 24 }}
                />
                <Text type="secondary">
                  正在分析音频内容，提取健康信息，生成个性化健康简历...
                </Text>
              </Card>
            )}
            
            {/* AI解析结果 */}
            {analysisCompleted && (
              <Card title="AI解析结果" style={{ marginBottom: 24 }}>
                {/* 识别准确率显示 */}
                <div style={{ 
                  marginBottom: '16px',
                  padding: '12px',
                  background: recognitionAccuracy >= 95 ? '#f6ffed' : recognitionAccuracy >= 90 ? '#fffbe6' : '#fff2f0',
                  border: `1px solid ${recognitionAccuracy >= 95 ? '#b7eb8f' : recognitionAccuracy >= 90 ? '#ffe58f' : '#ffccc7'}`,
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ 
                      fontSize: '14px', 
                      fontWeight: 'bold',
                      color: recognitionAccuracy >= 95 ? '#52c41a' : recognitionAccuracy >= 90 ? '#faad14' : '#ff4d4f'
                    }}>
                      识别准确率: {recognitionAccuracy}%
                    </span>
                    <span style={{ 
                      marginLeft: '8px', 
                      fontSize: '12px', 
                      color: '#666' 
                    }}>
                      {recognitionAccuracy >= 95 ? '优秀' : recognitionAccuracy >= 90 ? '良好' : '一般'}
                    </span>
                  </div>
                  <Progress 
                    percent={recognitionAccuracy} 
                    size="small" 
                    strokeColor={recognitionAccuracy >= 95 ? '#52c41a' : recognitionAccuracy >= 90 ? '#faad14' : '#ff4d4f'}
                    style={{ width: '120px' }}
                    showInfo={false}
                  />
                </div>
                
                <div style={{ 
                  background: '#f5f5f5', 
                  padding: '16px', 
                  borderRadius: '6px',
                  marginBottom: '16px',
                  lineHeight: '1.6'
                }}>
                  {analysisResult}
                </div>
                
                {/* 对话解析显示 */}
                {analysisResult && (
                  <Card 
                    title="对话解析" 
                    size="small" 
                    style={{ marginBottom: '16px' }}
                    extra={
                      <Tag color="blue">
                        {parseDialogue(analysisResult).length} 条对话
                      </Tag>
                    }
                  >
                    <div style={{
                      background: '#f8f9fa',
                      border: '1px solid #e9ecef',
                      borderRadius: '6px',
                      padding: '16px',
                      maxHeight: '400px',
                      overflowY: 'auto'
                    }}>
                      {parseDialogue(analysisResult).map((item, index) => (
                        <div key={index} style={{ 
                          marginBottom: '12px',
                          display: 'flex',
                          alignItems: 'flex-start'
                        }}>
                          <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            backgroundColor: item.isDoctor ? '#1890ff' : '#52c41a',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            marginRight: '8px',
                            flexShrink: 0,
                            marginTop: '2px'
                          }}>
                            {item.isDoctor ? '医' : '患'}
                          </div>
                          <div style={{
                            flex: 1,
                            padding: '8px 12px',
                            background: item.isDoctor ? '#e6f7ff' : '#f6ffed',
                            border: `1px solid ${item.isDoctor ? '#91d5ff' : '#b7eb8f'}`,
                            borderRadius: '6px',
                            position: 'relative'
                          }}>
                            <div style={{
                              fontWeight: 'bold',
                              marginBottom: '4px',
                              color: item.isDoctor ? '#1890ff' : '#52c41a',
                              fontSize: '12px'
                            }}>
                              {item.speaker}：
                            </div>
                            <div style={{
                              fontSize: '13px',
                              lineHeight: '1.5',
                              color: '#333'
                            }}>
                              {item.content}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
                
                <div style={{ textAlign: 'center' }}>
                  <Button 
                    type="primary" 
                    size="large"
                    icon={<CheckOutlined />}
                    onClick={confirmAnalysisResult}
                  >
                    确认解析结果，生成健康简历
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* 健康简历展示 */}
        {currentStep >= 2 && healthResume && (
          <div>
            <Row gutter={[24, 24]}>
              <Col span={6}>
                <Card title="主题导航" size="small">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button 
                      type={selectedTheme === 'overview' ? 'primary' : 'default'}
                      block
                      icon={<UserOutlined />}
                      onClick={() => setSelectedTheme('overview')}
                    >
                      概览
                    </Button>
                    <Button 
                      type={selectedTheme === 'physical' ? 'primary' : 'default'}
                      block
                      icon={<HeartOutlined />}
                      onClick={() => setSelectedTheme('physical')}
                    >
                      身体健康
                    </Button>
                    <Button 
                      type={selectedTheme === 'psychological' ? 'primary' : 'default'}
                      block
                      icon={<BarChartOutlined />}
                      onClick={() => setSelectedTheme('psychological')}
                    >
                      心理状态
                    </Button>
                    <Button 
                      type={selectedTheme === 'lifestyle' ? 'primary' : 'default'}
                      block
                      icon={<EnvironmentOutlined />}
                      onClick={() => setSelectedTheme('lifestyle')}
                    >
                      生活方式
                    </Button>
                    <Button 
                      type={selectedTheme === 'social' ? 'primary' : 'default'}
                      block
                      icon={<TeamOutlined />}
                      onClick={() => setSelectedTheme('social')}
                    >
                      社交支持
                    </Button>
                  </Space>
                  
                  <Divider />
                  
                  <Button 
                    type="dashed" 
                    block 
                    icon={<PlusOutlined />}
                    onClick={() => setIsAddingEvent(true)}
                  >
                    添加新事件
                  </Button>
                </Card>
              </Col>
              
              <Col span={18}>
                {selectedTheme === 'overview' && renderOverview()}
                {selectedTheme !== 'overview' && renderThemeDetail(selectedTheme)}
              </Col>
            </Row>
          </div>
        )}

        {/* 添加事件模态框 */}
        <Modal
          title="添加新事件"
          open={isAddingEvent}
          onCancel={() => setIsAddingEvent(false)}
          onOk={() => form.submit()}
        >
          <Form form={form} onFinish={handleAddEvent} layout="vertical">
            <Form.Item name="theme" label="主题" rules={[{ required: true }]}>
              <Select>
                <Option value="physical">身体健康</Option>
                <Option value="psychological">心理状态</Option>
                <Option value="lifestyle">生活方式</Option>
                <Option value="social">社交支持</Option>
              </Select>
            </Form.Item>
            
            <Form.Item name="year" label="时间" rules={[{ required: true }]}>
              <Input placeholder="如：2023.06" />
            </Form.Item>
            
            <Form.Item name="event" label="事件" rules={[{ required: true }]}>
              <Input placeholder="事件标题" />
            </Form.Item>
            
            <Form.Item name="details" label="详细信息" rules={[{ required: true }]}>
              <TextArea rows={4} placeholder="详细描述..." />
            </Form.Item>
            
            <Form.Item name="type" label="类型" rules={[{ required: true }]}>
              <Select>
                <Option value="medical">医疗</Option>
                <Option value="improvement">改善</Option>
                <Option value="stress">压力</Option>
                <Option value="lifestyle">生活方式</Option>
                <Option value="social">社交</Option>
              </Select>
            </Form.Item>
          </Form>
        </Modal>
            </div>
          )}

          {/* 需求评估步骤 */}
          {!showPlanDetail && selectedMenu === 'stage2' && (
            <div>
              <Card title="多维健康需求评估" style={{ marginBottom: 24 }}>
                <Paragraph>
                  第二、三阶段：基于提取的核心信息，从五个维度对个体的健康需求进行全面评估，并展示逻辑推理链路。
                </Paragraph>
                <Paragraph>
                  本阶段模型主要作用：多维度健康需求分析、问题严重程度评估、逻辑推理链路展示，并与知识图谱进行匹配，对推理置信度进行评估。通过客户服务结果的反馈，反向提高整体推理置信度，形成非标准健康医学类资产。注重信息的积累与反向推进可靠知识的积累。
                </Paragraph>
              </Card>

              {/* 问题严重程度统计 */}
              <Card title="问题严重程度统计" style={{ marginBottom: 24 }}>
                <Row gutter={[16, 16]}>
                  <Col span={8}>
                    <Card size="small" style={{ textAlign: 'center', background: '#fff2f0', border: '1px solid #ffccc7' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff4d4f', marginBottom: '8px' }}>
                        18
                      </div>
                      <div style={{ color: '#ff4d4f', fontWeight: 'bold' }}>重度问题</div>
                      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
                        需要立即干预
                      </div>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small" style={{ textAlign: 'center', background: '#fff7e6', border: '1px solid #ffd591' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fa8c16', marginBottom: '8px' }}>
                        45
                      </div>
                      <div style={{ color: '#fa8c16', fontWeight: 'bold' }}>中度问题</div>
                      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
                        需要重点关注
                      </div>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card size="small" style={{ textAlign: 'center', background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                      <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#52c41a', marginBottom: '8px' }}>
                        28
                      </div>
                      <div style={{ color: '#52c41a', fontWeight: 'bold' }}>轻度问题</div>
                      <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px' }}>
                        需要预防管理
                      </div>
                    </Card>
                  </Col>
                </Row>
                
                <div style={{ marginTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>问题分布概览</span>
                    <span style={{ fontSize: '12px', color: '#8c8c8c' }}>总计: 91个问题</span>
                  </div>
                  <div style={{ display: 'flex', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ 
                      width: '20%', 
                      background: '#ff4d4f',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}>
                      20%
                    </div>
                    <div style={{ 
                      width: '49%', 
                      background: '#fa8c16',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}>
                      49%
                    </div>
                    <div style={{ 
                      width: '31%', 
                      background: '#52c41a',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 'bold'
                    }}>
                      31%
                    </div>
                  </div>
                </div>
              </Card>

              {/* 五维度评估 */}
              <Row gutter={[16, 16]}>
                <Col span={showConfidencePanel ? 16 : 24}>
                  <Card 
                    title="五维度健康需求评估" 
                    style={{ marginBottom: 24 }}
                    extra={
                      <Space>
                        <Button 
                          type="primary" 
                          icon={<ThunderboltOutlined />}
                          onClick={startConfidenceEvaluation}
                          loading={confidenceEvaluating}
                          disabled={confidenceEvaluating}
                        >
                          置信度评估
                        </Button>
                        {showConfidencePanel && (
                          <Button 
                            type="text" 
                            icon={<ArrowLeftOutlined />}
                            onClick={toggleConfidencePanel}
                          >
                            收起
                          </Button>
                        )}
                        {!showConfidencePanel && Object.keys(confidenceResults).length > 0 && (
                          <Button 
                            type="default" 
                            icon={<ArrowRightOutlined />}
                            onClick={toggleConfidencePanel}
                            title="查看评估结果"
                          >
                            查看结果
                          </Button>
                        )}
                      </Space>
                    }
                  >
                    <Tabs 
                      defaultActiveKey="biomedical" 
                      activeKey={activeTab}
                      onChange={setActiveTab}
                      items={[
                      {
                        key: 'biomedical',
                        label: (
                          <span>
                            生物医学维度
                            {confidenceResults.biomedical && (
                              <Tag color={getConfidenceColor('高')} style={{ marginLeft: 8 }}>
                                已评估
                              </Tag>
                            )}
                          </span>
                        ),
                        children: (
                          <div>
                            <Title level={4}>生理、病理、药理多学科分析</Title>
                            <div style={{ marginBottom: 16 }}>
                              <Text strong>评估要点：</Text>
                              <ul>
                                <li>生理指标异常分析（BMI、血压、血糖等）</li>
                                <li>病理机制推理（如高盐饮食→血压升高→心血管风险）</li>
                                <li>药理作用机制（药物相互作用、副作用风险）</li>
                              </ul>
                            </div>
                            
                            {/* 基础医学类 */}
                            <Card size="small" title="基础医学类" style={{ marginBottom: 16 }}>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>解剖学：</Text>
                                <div style={{ 
                                  marginTop: 8, 
                                  padding: 12, 
                                  background: '#f5f5f5', 
                                  borderRadius: 6,
                                  ...getConfidenceBorderStyle('biomedical', 0)
                                }}>
                                  <Tag color="blue">超重（BMI 25.9）</Tag> → 
                                  <Tag color="orange">体脂分布异常</Tag> → 
                                  <Tag color="orange">腹腔内脂肪堆积</Tag> → 
                                  <Tag color="red">肝脏、胰腺等器官周围脂肪浸润</Tag> → 
                                  <Tag color="red">增加脂肪肝、胰岛素抵抗风险</Tag>
                                  {getConfidenceBadge('biomedical', 0)}
                                </div>
                              </div>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>生理学：</Text>
                                <div style={{ 
                                  marginTop: 8, 
                                  padding: 12, 
                                  background: '#f5f5f5', 
                                  borderRadius: 6,
                                  ...getConfidenceBorderStyle('biomedical', 1)
                                }}>
                                  <Tag color="blue">工作压力大</Tag> → 
                                  <Tag color="orange">HPA轴激活</Tag> → 
                                  <Tag color="orange">皮质醇持续分泌↑</Tag> → 
                                  <Tag color="orange">抑制褪黑素合成</Tag> → 
                                  <Tag color="red">睡眠周期紊乱</Tag>
                                  {getConfidenceBadge('biomedical', 1)}
                                </div>
                                <div style={{ 
                                  marginTop: 8, 
                                  padding: 12, 
                                  background: '#f5f5f5', 
                                  borderRadius: 6,
                                  ...getConfidenceBorderStyle('biomedical', 2)
                                }}>
                                  <Tag color="blue">疲劳感增加</Tag> → 
                                  <Tag color="orange">交感神经持续兴奋</Tag> → 
                                  <Tag color="orange">心率↑、血压↑</Tag> → 
                                  <Tag color="red">心血管系统负荷加重</Tag>
                                  {getConfidenceBadge('biomedical', 2)}
                                </div>
                              </div>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>病理学：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">长期压力 + 睡眠质量下降</Tag> → 
                                  <Tag color="orange">免疫功能抑制（T细胞活性↓）</Tag> → 
                                  <Tag color="orange">慢性炎症反应↑</Tag> → 
                                  <Tag color="red">加速动脉粥样硬化病理进程</Tag>
                                </div>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">超重</Tag> → 
                                  <Tag color="orange">脂肪细胞因子分泌异常（如瘦素抵抗）</Tag> → 
                                  <Tag color="orange">诱发胰岛素抵抗</Tag> → 
                                  <Tag color="red">糖尿病前期病理改变</Tag>
                                </div>
                              </div>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>生物化学与分子生物学：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">睡眠剥夺</Tag> → 
                                  <Tag color="orange">下丘脑食欲调节因子失衡（瘦素↓、饥饿素↑）</Tag> → 
                                  <Tag color="orange">中枢性食欲亢进</Tag> → 
                                  <Tag color="red">能量代谢紊乱</Tag>
                                </div>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">压力应激</Tag> → 
                                  <Tag color="orange">端粒酶活性下降</Tag> → 
                                  <Tag color="red">细胞衰老加速</Tag>
                                </div>
                              </div>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>免疫学：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">慢性压力</Tag> → 
                                  <Tag color="orange">Th1/Th2细胞失衡</Tag> → 
                                  <Tag color="orange">促炎因子（IL-6、TNF-α）分泌↑</Tag> → 
                                  <Tag color="red">自身免疫风险增加（如桥本甲状腺炎）</Tag>
                                </div>
                              </div>
                              <div>
                                <Text strong>遗传学：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">若携带FTO基因变异</Tag> → 
                                  <Tag color="orange">肥胖易感性增加</Tag> → 
                                  <Tag color="orange">与环境因素（久坐、高糖饮食）协同</Tag> → 
                                  <Tag color="red">BMI超标</Tag>
                                </div>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">COMT基因多态性</Tag> → 
                                  <Tag color="orange">影响多巴胺代谢</Tag> → 
                                  <Tag color="orange">压力耐受能力下降</Tag> → 
                                  <Tag color="red">加剧疲劳感</Tag>
                                </div>
                              </div>
                            </Card>

                            {/* 临床医学类 */}
                            <Card size="small" title="临床医学类" style={{ marginBottom: 16 }}>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>内科学：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">超重 + 工作压力</Tag> → 
                                  <Tag color="orange">血压监测（收缩压/舒张压可能≥130/80 mmHg）</Tag> → 
                                  <Tag color="red">高血压前期</Tag>
                                </div>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">疲劳 + 睡眠障碍</Tag> → 
                                  <Tag color="orange">血糖检测（空腹血糖≥6.1 mmol/L）</Tag> → 
                                  <Tag color="red">糖调节受损</Tag>
                                </div>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">长期久坐</Tag> → 
                                  <Tag color="orange">血脂异常（LDL-C↑、HDL-C↓）</Tag> → 
                                  <Tag color="red">动脉粥样硬化风险评估</Tag>
                                </div>
                              </div>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>外科学：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">久坐IT职业</Tag> → 
                                  <Tag color="orange">腰椎MRI检查（L4-L5椎间盘突出可能）</Tag> → 
                                  <Tag color="red">骨科干预（如物理治疗或手术指征评估）</Tag>
                                </div>
                              </div>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>神经病学：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">睡眠质量下降</Tag> → 
                                  <Tag color="orange">多导睡眠图（PSG）检查</Tag> → 
                                  <Tag color="red">排除阻塞性睡眠呼吸暂停低通气综合征（OSAHS）</Tag>
                                </div>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">长期压力</Tag> → 
                                  <Tag color="orange">偏头痛或紧张性头痛发作频率增加</Tag> → 
                                  <Tag color="red">神经系统功能紊乱</Tag>
                                </div>
                              </div>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>精神病学：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">疲劳 + 工作压力</Tag> → 
                                  <Tag color="orange">抑郁焦虑量表（PHQ-9/GAD-7）评估</Tag> → 
                                  <Tag color="red">可能存在轻度抑郁或焦虑障碍</Tag>
                                </div>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">睡眠障碍</Tag> → 
                                  <Tag color="orange">生物钟紊乱</Tag> → 
                                  <Tag color="red">双向情感障碍早期症状排查</Tag>
                                </div>
                              </div>
                              <div>
                                <Text strong>影像学：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">超重</Tag> → 
                                  <Tag color="orange">肝脏超声（脂肪肝分级）</Tag>
                                </div>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">疑似OSAHS</Tag> → 
                                  <Tag color="orange">颈部CT（评估气道狭窄程度）</Tag>
                                </div>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">久坐腰痛</Tag> → 
                                  <Tag color="orange">腰椎X线/CT（骨质增生或椎间盘退变）</Tag>
                                </div>
                              </div>
                            </Card>
                          </div>
                        )
                      },
                      {
                        key: 'psychological',
                        label: (
                          <span>
                            心理维度
                            {confidenceResults.psychological && (
                              <Tag color={getConfidenceColor('高')} style={{ marginLeft: 8 }}>
                                已评估
                              </Tag>
                            )}
                          </span>
                        ),
                        children: (
                          <div>
                            <Title level={4}>情绪、压力、认知需求分析</Title>
                            <div style={{ marginBottom: 16 }}>
                              <Text strong>评估要点：</Text>
                              <ul>
                                <li>工作压力与心理健康关联</li>
                                <li>睡眠质量对情绪的影响</li>
                                <li>家庭责任与心理负荷</li>
                              </ul>
                            </div>
                            
                            {/* 心理相关分析 */}
                            <Card size="small" title="心理状态评估" style={{ marginBottom: 16 }}>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>抑郁焦虑评估：</Text>
                                <div style={{ 
                                  marginTop: 8, 
                                  padding: 12, 
                                  background: '#f5f5f5', 
                                  borderRadius: 6,
                                  ...getConfidenceBorderStyle('psychological', 0)
                                }}>
                                  <Tag color="blue">疲劳 + 工作压力</Tag> → 
                                  <Tag color="orange">抑郁焦虑量表（PHQ-9/GAD-7）评估</Tag> → 
                                  <Tag color="red">可能存在轻度抑郁或焦虑障碍</Tag>
                                  {getConfidenceBadge('psychological', 0)}
                                </div>
                              </div>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>睡眠心理影响：</Text>
                                <div style={{ 
                                  marginTop: 8, 
                                  padding: 12, 
                                  background: '#f5f5f5', 
                                  borderRadius: 6,
                                  ...getConfidenceBorderStyle('psychological', 1)
                                }}>
                                  <Tag color="blue">睡眠障碍</Tag> → 
                                  <Tag color="orange">生物钟紊乱</Tag> → 
                                  <Tag color="red">双向情感障碍早期症状排查</Tag>
                                  {getConfidenceBadge('psychological', 1)}
                                </div>
                              </div>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>压力认知：</Text>
                                <div style={{ 
                                  marginTop: 8, 
                                  padding: 12, 
                                  background: '#f5f5f5', 
                                  borderRadius: 6,
                                  ...getConfidenceBorderStyle('psychological', 2)
                                }}>
                                  <Tag color="blue">压力认知评估</Tag> → 
                                  <Tag color="orange">非理性信念（如"必须完美完成工作"）</Tag> → 
                                  <Tag color="red">认知行为疗法（CBT）修正</Tag>
                                  {getConfidenceBadge('psychological', 2)}
                                </div>
                              </div>
                              <div>
                                <Text strong>职场心理健康：</Text>
                                <div style={{ 
                                  marginTop: 8, 
                                  padding: 12, 
                                  background: '#f5f5f5', 
                                  borderRadius: 6,
                                  ...getConfidenceBorderStyle('psychological', 3)
                                }}>
                                  <Tag color="blue">健康话题职场禁忌+情绪压抑</Tag> → 
                                  <Tag color="orange">心理健康咨询利用率&lt;5%</Tag> → 
                                  <Tag color="red">重度焦虑症检出率高出社会均值40%</Tag>
                                  {getConfidenceBadge('psychological', 3)}
                                </div>
                              </div>
                            </Card>

                            {/* 心身交互 */}
                            <Card size="small" title="心身交互作用" style={{ marginBottom: 16 }}>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>心理生理关联：</Text>
                                <div style={{ 
                                  marginTop: 8, 
                                  padding: 12, 
                                  background: '#f5f5f5', 
                                  borderRadius: 6,
                                  ...getConfidenceBorderStyle('psychological', 4)
                                }}>
                                  <Tag color="blue">心身交互作用</Tag> → 
                                  <Tag color="orange">心理压力 → 自主神经功能紊乱</Tag> → 
                                  <Tag color="red">胃肠道症状（如肠易激综合征）</Tag>
                                  {getConfidenceBadge('psychological', 4)}
                                </div>
                              </div>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>工作压力影响：</Text>
                                <div style={{ 
                                  marginTop: 8, 
                                  padding: 12, 
                                  background: '#f5f5f5', 
                                  borderRadius: 6,
                                  ...getConfidenceBorderStyle('psychological', 5)
                                }}>
                                  <Tag color="blue">IT行业工作压力</Tag> → 
                                  <Tag color="orange">焦虑情绪增加</Tag> → 
                                  <Tag color="red">睡眠质量下降</Tag>
                                  {getConfidenceBadge('psychological', 5)}
                                </div>
                              </div>
                              <div>
                                <Text strong>家庭心理负荷：</Text>
                                <div style={{ 
                                  marginTop: 8, 
                                  padding: 12, 
                                  background: '#f5f5f5', 
                                  borderRadius: 6,
                                  ...getConfidenceBorderStyle('psychological', 6)
                                }}>
                                  <Tag color="blue">已婚育状态</Tag> → 
                                  <Tag color="orange">家庭责任压力</Tag> → 
                                  <Tag color="red">心理负荷增加</Tag>
                                  {getConfidenceBadge('psychological', 6)}
                                </div>
                              </div>
                            </Card>
                          </div>
                        )
                      },
                      {
                        key: 'social',
                        label: (
                          <span>
                            社会环境维度
                            {confidenceResults.social && (
                              <Tag color={getConfidenceColor('高')} style={{ marginLeft: 8 }}>
                                已评估
                              </Tag>
                            )}
                          </span>
                        ),
                        children: (
                          <div>
                            <Title level={4}>居住环境、职业特点、社交支持分析</Title>
                            <div style={{ marginBottom: 16 }}>
                              <Text strong>评估要点：</Text>
                              <ul>
                                <li>职业环境对健康的影响</li>
                                <li>居住环境与生活方式</li>
                                <li>社交网络与支持系统</li>
                              </ul>
                            </div>
                            
                            {/* 职业发展影响 */}
                            <Card size="small" title="职业发展影响" style={{ marginBottom: 16 }}>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>技术更新压力：</Text>
                                <div style={{ 
                                  marginTop: 8, 
                                  padding: 12, 
                                  background: '#f5f5f5', 
                                  borderRadius: 6,
                                  ...getConfidenceBorderStyle('social', 0)
                                }}>
                                  <Tag color="blue">技术更新快</Tag> → 
                                  <Tag color="orange">加班挤占学习时间</Tag> → 
                                  <Tag color="orange">新技术学习滞后（滞后行业平均更新速度3个月以上）</Tag> → 
                                  <Tag color="red">职业发展机会减少（晋升/跳槽成功率降低）</Tag>
                                  {getConfidenceBadge('social', 0)}
                                </div>
                              </div>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>工作满意度：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">长时间工作+持续应激状态</Tag> → 
                                  <Tag color="orange">皮质醇水平持续升高</Tag> → 
                                  <Tag color="orange">工作满意度下降</Tag> → 
                                  <Tag color="red">离职意向形成</Tag>
                                </div>
                              </div>
                              <div>
                                <Text strong>职业规划：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">本科学历+行业竞争焦虑</Tag> → 
                                  <Tag color="orange">主动延长工作时长（周均加班≥15小时）</Tag> → 
                                  <Tag color="orange">职业规划失衡</Tag> → 
                                  <Tag color="red">忽视技术架构/管理能力培养</Tag>
                                </div>
                              </div>
                            </Card>

                            {/* 工作文化影响 */}
                            <Card size="small" title="工作文化影响" style={{ marginBottom: 16 }}>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>病假文化：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">"带病工作光荣"观念+peer pressure</Tag> → 
                                  <Tag color="orange">病假申请率&lt;实际需求50%</Tag> → 
                                  <Tag color="red">群体患病率年增12%</Tag>
                                </div>
                              </div>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>行业内卷：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">个体内卷行为+行业模仿效应</Tag> → 
                                  <Tag color="orange">群体工作时长普遍化（行业周均工时≥55小时）</Tag> → 
                                  <Tag color="red">行业创新活力下降（专利申请量年降10%）</Tag>
                                </div>
                              </div>
                              <div>
                                <Text strong>收入健康权衡：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">中等偏高收入预期+晋升诱惑</Tag> → 
                                  <Tag color="orange">接受996工作制</Tag> → 
                                  <Tag color="orange">健康管理缺失（年度体检率&lt;30%）</Tag> → 
                                  <Tag color="red">医疗支出增加（慢性病治疗费用占年收入15%+）</Tag>
                                </div>
                              </div>
                            </Card>

                            {/* 家庭社会关系 */}
                            <Card size="small" title="家庭社会关系" style={{ marginBottom: 16 }}>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>亲子关系：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">已婚育状态+高强度工作</Tag> → 
                                  <Tag color="orange">亲子互动时间&lt;2小时/日</Tag> → 
                                  <Tag color="red">子女教育问题（成绩下降幅度≥15%）</Tag>
                                </div>
                              </div>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>夫妻关系：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">夫妻双方工作压力+未明确分工</Tag> → 
                                  <Tag color="orange">家庭沟通时间&lt;30分钟/日</Tag> → 
                                  <Tag color="red">婚姻满意度下降</Tag>
                                </div>
                              </div>
                              <div>
                                <Text strong>社交支持：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">社交圈局限同事+行业竞争关系</Tag> → 
                                  <Tag color="orange">深度倾诉对象≤1人</Tag> → 
                                  <Tag color="red">抑郁情绪发生率高出行业均值25%</Tag>
                                </div>
                              </div>
                            </Card>

                            {/* 居住环境 */}
                            <Card size="small" title="居住环境" style={{ marginBottom: 16 }}>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>睡眠环境：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">工作区与卧室未隔离+家居布局杂乱</Tag> → 
                                  <Tag color="orange">入睡潜伏期&gt;45分钟（正常&lt;30分钟）</Tag> → 
                                  <Tag color="red">深睡眠比例&lt;15%（正常20-25%）</Tag>
                                </div>
                              </div>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>噪音污染：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">居住密度&gt;1.5人/㎡+噪音污染（≥55分贝）</Tag> → 
                                  <Tag color="orange">睡眠中断次数≥3次/夜</Tag> → 
                                  <Tag color="red">日间功能障碍评分≥12分（正常&lt;8分）</Tag>
                                </div>
                              </div>
                              <div>
                                <Text strong>空气质量：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">缺乏自然采光+通风不良</Tag> → 
                                  <Tag color="orange">室内PM2.5浓度≥50μg/m³</Tag> → 
                                  <Tag color="red">呼吸道症状发生率年增22%</Tag>
                                </div>
                              </div>
                            </Card>
                          </div>
                        )
                      },
                      {
                        key: 'institutional',
                        label: (
                          <span>
                            制度政策维度
                            {confidenceResults.institutional && (
                              <Tag color={getConfidenceColor('高')} style={{ marginLeft: 8 }}>
                                已评估
                              </Tag>
                            )}
                          </span>
                        ),
                        children: (
                          <div>
                            <Title level={4}>医保政策、就医流程、公共卫生服务分析</Title>
                            <div style={{ marginBottom: 16 }}>
                              <Text strong>评估要点：</Text>
                              <ul>
                                <li>医保覆盖范围与报销比例</li>
                                <li>就医便利性与成本</li>
                                <li>公共卫生服务可及性</li>
                              </ul>
                            </div>
                            
                            {/* 医疗保障制度 */}
                            <Card size="small" title="医疗保障制度" style={{ marginBottom: 16 }}>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>医保覆盖：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">慢性病管理需求</Tag> → 
                                  <Tag color="orange">医保政策匹配</Tag> → 
                                  <Tag color="red">医疗费用负担</Tag>
                                </div>
                              </div>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>健康管理：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">企业健康管理缺失</Tag> → 
                                  <Tag color="orange">员工健康意识不足</Tag> → 
                                  <Tag color="red">慢性病风险增加</Tag>
                                </div>
                              </div>
                              <div>
                                <Text strong>医疗资源：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">医疗资源分配不均</Tag> → 
                                  <Tag color="orange">优质医疗资源集中</Tag> → 
                                  <Tag color="red">基层医疗服务能力不足</Tag>
                                </div>
                              </div>
                            </Card>

                            {/* 工作制度 */}
                            <Card size="small" title="工作制度" style={{ marginBottom: 16 }}>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>工时制度：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">996工作制</Tag> → 
                                  <Tag color="orange">长期超时工作</Tag> → 
                                  <Tag color="red">职业健康风险增加</Tag>
                                </div>
                              </div>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>休假制度：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">年假制度执行不严</Tag> → 
                                  <Tag color="orange">员工休息不足</Tag> → 
                                  <Tag color="red">疲劳累积</Tag>
                                </div>
                              </div>
                              <div>
                                <Text strong>健康检查：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">企业健康检查制度缺失</Tag> → 
                                  <Tag color="orange">员工健康监测不足</Tag> → 
                                  <Tag color="red">健康问题发现滞后</Tag>
                                </div>
                              </div>
                            </Card>

                            {/* 政策支持 */}
                            <Card size="small" title="政策支持" style={{ marginBottom: 16 }}>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>健康促进政策：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">健康促进政策执行不力</Tag> → 
                                  <Tag color="orange">健康行为改变困难</Tag> → 
                                  <Tag color="red">健康水平提升缓慢</Tag>
                                </div>
                              </div>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>心理健康政策：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">心理健康服务覆盖不足</Tag> → 
                                  <Tag color="orange">心理问题识别率低</Tag> → 
                                  <Tag color="red">心理健康问题加重</Tag>
                                </div>
                              </div>
                              <div>
                                <Text strong>环境健康政策：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">环境健康标准执行不严</Tag> → 
                                  <Tag color="orange">环境污染影响健康</Tag> → 
                                  <Tag color="red">环境相关疾病增加</Tag>
                                </div>
                              </div>
                            </Card>
                          </div>
                        )
                      },
                      {
                        key: 'lifecourse',
                        label: (
                          <span>
                            生命历程维度
                            {confidenceResults.lifecourse && (
                              <Tag color={getConfidenceColor('高')} style={{ marginLeft: 8 }}>
                                已评估
                              </Tag>
                            )}
                          </span>
                        ),
                        children: (
                          <div>
                            <Title level={4}>年龄、性别、生命周期阶段分析</Title>
                            <div style={{ marginBottom: 16 }}>
                              <Text strong>评估要点：</Text>
                              <ul>
                                <li>中年期健康风险特征</li>
                                <li>男性健康管理重点</li>
                                <li>家庭责任期健康需求</li>
                              </ul>
                            </div>
                            
                            {/* 年龄相关健康风险 */}
                            <Card size="small" title="年龄相关健康风险" style={{ marginBottom: 16 }}>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>中年期代谢变化：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">42岁中年期</Tag> → 
                                  <Tag color="orange">代谢功能下降</Tag> → 
                                  <Tag color="red">慢性病风险增加</Tag>
                                </div>
                              </div>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>激素水平变化：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">男性睾酮水平下降</Tag> → 
                                  <Tag color="orange">肌肉量减少</Tag> → 
                                  <Tag color="red">基础代谢率下降</Tag>
                                </div>
                              </div>
                              <div>
                                <Text strong>认知功能：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">中年期认知功能开始下降</Tag> → 
                                  <Tag color="orange">工作记忆能力减弱</Tag> → 
                                  <Tag color="red">工作效率下降</Tag>
                                </div>
                              </div>
                            </Card>

                            {/* 性别相关健康特点 */}
                            <Card size="small" title="性别相关健康特点" style={{ marginBottom: 16 }}>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>男性健康管理：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">男性健康意识相对较低</Tag> → 
                                  <Tag color="orange">主动就医率低</Tag> → 
                                  <Tag color="red">疾病发现延迟</Tag>
                                </div>
                              </div>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>心血管风险：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">男性心血管疾病风险较高</Tag> → 
                                  <Tag color="orange">需要重点关注血压、血脂</Tag> → 
                                  <Tag color="red">定期心血管检查</Tag>
                                </div>
                              </div>
                              <div>
                                <Text strong>前列腺健康：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">中年男性前列腺问题</Tag> → 
                                  <Tag color="orange">需要定期前列腺检查</Tag> → 
                                  <Tag color="red">预防前列腺疾病</Tag>
                                </div>
                              </div>
                            </Card>

                            {/* 家庭责任期健康需求 */}
                            <Card size="small" title="家庭责任期健康需求" style={{ marginBottom: 16 }}>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>家庭健康管理：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">已婚育状态</Tag> → 
                                  <Tag color="orange">家庭健康管理责任</Tag> → 
                                  <Tag color="red">健康行为示范需求</Tag>
                                </div>
                              </div>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>经济压力：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">家庭经济责任重</Tag> → 
                                  <Tag color="orange">工作压力大</Tag> → 
                                  <Tag color="red">健康管理时间不足</Tag>
                                </div>
                              </div>
                              <div>
                                <Text strong>子女教育：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">子女教育投入大</Tag> → 
                                  <Tag color="orange">时间精力分配</Tag> → 
                                  <Tag color="red">个人健康管理优先级下降</Tag>
                                </div>
                              </div>
                            </Card>

                            {/* 职业发展期健康特点 */}
                            <Card size="small" title="职业发展期健康特点" style={{ marginBottom: 16 }}>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>职业压力：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">职业发展关键期</Tag> → 
                                  <Tag color="orange">工作压力大</Tag> → 
                                  <Tag color="red">长期应激状态</Tag>
                                </div>
                              </div>
                              <div style={{ marginBottom: 12 }}>
                                <Text strong>学习压力：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">技术更新快</Tag> → 
                                  <Tag color="orange">持续学习压力</Tag> → 
                                  <Tag color="red">认知负荷过重</Tag>
                                </div>
                              </div>
                              <div>
                                <Text strong>职业规划：</Text>
                                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 6 }}>
                                  <Tag color="blue">职业规划与健康管理平衡</Tag> → 
                                  <Tag color="orange">需要制定可持续的职业发展策略</Tag> → 
                                  <Tag color="red">避免过度透支健康</Tag>
                                </div>
                              </div>
                            </Card>
                          </div>
                        )
                      }
                    ]} />
                  </Card>
                </Col>
                
                {/* 置信度评估展示面板 */}
                {showConfidencePanel && (
                  <Col span={8}>
                    <Card 
                      title="置信度评估结果" 
                      style={{ marginBottom: 24, height: '2160px' }}
                      extra={
                        <Button 
                          type="text" 
                          icon={<ArrowLeftOutlined />}
                          onClick={toggleConfidencePanel}
                        >
                          收起
                        </Button>
                      }
                    >
                      <div style={{ 
                        height: '2060px', 
                        overflow: 'auto',
                        backgroundColor: '#000',
                        color: '#fff',
                        padding: '16px',
                        fontFamily: 'monospace',
                        fontSize: '12px',
                        lineHeight: '1.5'
                      }}>
                        {confidenceLogs.slice(0, currentLogIndex).map((log, index) => (
                          <div key={index} style={{ marginBottom: '4px' }}>
                            {log}
                          </div>
                        ))}
                        {confidenceEvaluating && (
                          <div style={{ color: '#52c41a' }}>
                            <SyncOutlined spin /> 正在评估...
                          </div>
                        )}
                      </div>
                    </Card>
                  </Col>
                )}
              </Row>


              {/* 验证结果 */}
              <Card title="需求验证结果" style={{ marginBottom: 24 }}>
                {Object.keys(confidenceResults).length > 0 ? (
                  <div>
                <div style={{ marginBottom: 16 }}>
                  <Text strong>验证依据：</Text>
                  <ul>
                    <li>医学领域：基于权威医学知识图谱和临床指南</li>
                    <li>非医学领域：符合社会科学、心理学等领域的公认理论</li>
                    <li>个体差异：充分考虑遗传背景、生活习惯、既往病史</li>
                  </ul>
                </div>
                <div>
                  <Text strong>总体评估：</Text>
                  <div style={{ marginTop: 8 }}>
                    <Progress 
                      percent={85} 
                      status="active" 
                      format={percent => `综合置信度 ${percent}%`}
                    />
                  </div>
                </div>
                  </div>
                ) : (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px 20px',
                    color: '#999',
                    fontSize: '14px'
                  }}>
                    <div style={{ marginBottom: '16px' }}>
                      <SyncOutlined style={{ fontSize: '24px' }} />
                    </div>
                    <div>等待置信度评估完成...</div>
                    <div style={{ fontSize: '12px', marginTop: '8px' }}>
                      点击"置信度评估"按钮开始评估
                    </div>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* 第三阶段：框架构建 */}
          {!showPlanDetail && selectedMenu === 'stage3' && (
            <div>
              <Card title="系统性问题解决框架构建" style={{ marginBottom: 24 }}>
                <Paragraph>
                  第四、五、六阶段：整合需求形成系统性问题解决框架。系统将零散、发散的健康需求点进行聚合与收敛，
                  整合为多个独立的、结构化的系统性问题解决框架（模块）。每个模块保持高度独立性，避免内容交叉或重复。
                </Paragraph>
                <Paragraph>
                  本阶段模型主要作用：提高健康需求聚合与收敛度、基于完整的理论及理由支持、构建健康问题的解决框架。推进对健康问题整体方案的全面和科学性，以及公司对于服务系统构建的全面性。注重健康方案的聚合度及理论，要求清晰与完整并可基于实际客户服务数据追踪优化。
                </Paragraph>
              </Card>

              {/* 框架构建功能直接嵌入 */}
              <FrameworkConstructionContent />
            </div>
          )}

          {/* 第四阶段：方案菜单 */}
          {!showPlanDetail && selectedMenu === 'stage4' && (
            <div>
              <Card title="个性化可实施方案" style={{ marginBottom: 24 }}>
                <Paragraph>
                  第七阶段：个性化可实施方案。基于公司服务元素库和客户偏好，生成可执行的个性化健康管理方案。
                  系统将理论性树形方案与公司现有产品服务元素库进行匹配，充分考虑客户的经济性、便利性、个人偏好等个体差异。
                </Paragraph>
                <Paragraph>
                  本阶段模型主要作用：基于公司内部服务元素库匹配、健康简历中传统意义的健康及非健康信息，结合为客户构建的健康解决方案框架构成的具体可执行的个性化方案生成，形成精准落地的产品及方案推荐。基于客户的购买与反馈调整模型的个性化方案生成准确度。注重使用过往环节生成的信息与既有数据，生成具体的方案推荐，并基于客户反馈调整模型的个性化方案生成准确度。
                </Paragraph>
              </Card>

              {/* 方案菜单功能 */}
              {renderPersonalizedPlanMenu()}
            </div>
          )}


          {/* 其他步骤的内容 */}
          {!showPlanDetail && selectedMenu !== 'stage1' && selectedMenu !== 'stage2' && selectedMenu !== 'stage3' && selectedMenu !== 'stage4' && (
            <div>
              <Card title={stageMenus.find(m => m.key === selectedMenu)?.title} style={{ marginBottom: 24 }}>
                <Paragraph>
                  {stageMenus.find(m => m.key === selectedMenu)?.description}
                </Paragraph>
                <Alert
                  message="功能开发中"
                  description="该步骤功能正在开发中，敬请期待！"
                  type="info"
                  showIcon
                />
              </Card>
            </div>
          )}
        </Content>
      </Layout>
      
      {/* 会员信息查询Modal */}
      <Modal
        title="查询到会员信息"
        open={showMemberInfoModal}
        onCancel={handleCancelUpdate}
        footer={[
          <Button key="cancel" onClick={handleCancelUpdate}>
            取消
          </Button>,
          <Button key="update" type="primary" onClick={handleUpdateHealthResume}>
            更新健康简历
          </Button>
        ]}
        width={800}
        style={{ top: 20 }}
      >
        {memberInfo && (
          <div>
            <Alert
              message="检测到会员信息"
              description={`已查询到会员 ${memberInfo.name} 的基本信息，是否要更新其健康简历？`}
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />
            
            <Row gutter={[24, 16]}>
              <Col span={12}>
                <Card title="基本信息" size="small">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="姓名">{memberInfo.name}</Descriptions.Item>
                    <Descriptions.Item label="年龄">{memberInfo.age}岁</Descriptions.Item>
                    <Descriptions.Item label="地区">{memberInfo.location}</Descriptions.Item>
                    <Descriptions.Item label="职业">{memberInfo.occupation}</Descriptions.Item>
                    <Descriptions.Item label="电话">{memberInfo.phone}</Descriptions.Item>
                    <Descriptions.Item label="邮箱">{memberInfo.email}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
              
              <Col span={12}>
                <Card title="健康状态" size="small">
                  <Descriptions column={1} size="small">
                    <Descriptions.Item label="健康状态">
                      <Tag color="green">{memberInfo.healthStatus}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="风险等级">
                      <Tag color="blue">{memberInfo.riskLevel}</Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="会员时间">{memberInfo.memberSince}</Descriptions.Item>
                    <Descriptions.Item label="最后更新">{memberInfo.lastUpdate}</Descriptions.Item>
                  </Descriptions>
                </Card>
              </Col>
            </Row>
            
            <Row gutter={[24, 16]} style={{ marginTop: 16 }}>
              <Col span={12}>
                <Card title="当前目标" size="small">
                  <div>
                    {memberInfo.currentGoals.map((goal, index) => (
                      <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                        {goal}
                      </Tag>
                    ))}
                  </div>
                </Card>
              </Col>
              
              <Col span={12}>
                <Card title="最近事件" size="small">
                  <div>
                    {memberInfo.recentEvents.map((event, index) => (
                      <Tag key={index} color="orange" style={{ marginBottom: 4 }}>
                        {event}
                      </Tag>
                    ))}
                  </div>
                </Card>
              </Col>
            </Row>
            
            <Alert
              message="更新说明"
              description="点击'更新健康简历'将把新数据累加到现有健康简历中，并进行智能整理合并。"
              type="warning"
              showIcon
              style={{ marginTop: 24 }}
            />
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default HealthResumeSystem;
