import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Space, 
  Tabs, 
  Alert,
  Spin,
  message
} from 'antd';
import { 
  DashboardOutlined, 
  FileTextOutlined, 
  BarChartOutlined,
  SettingOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import ExcelCaseCard from '../components/ExcelCaseCard';
import HealthAnalysisChart from '../components/HealthAnalysisChart';
import { healthAPI } from '../services/api';

const { Header, Content } = Layout;
const { Title, Text } = Typography;
// const { TabPane } = Tabs; // 不再使用TabPane

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [systemStatus, setSystemStatus] = useState(null);
  const [excelCaseData, setExcelCaseData] = useState(null);
  const [healthAnalysisData, setHealthAnalysisData] = useState(null);

  // Excel案例数据
  const mockExcelCaseData = {
    basic_info: {
      full_name: "李工程师",
      age: "42",
      gender: "男",
      occupation: "IT工程师",
      education: "本科学历",
      marital_status: "已婚有一子",
      height: "178cm",
      weight: "82kg",
      bmi: "25.9"
    },
    symptoms: [
      "疲劳感增加",
      "睡眠质量下降",
      "工作压力大"
    ],
    health_modules: [
      {
        name: "C1 睡眠-交感型疲劳系统",
        description: "涉及睡眠紊乱、压力引发的交感激活、生理恢复障碍等问题，常表现为疲劳、浅睡、早醒、白天无精打采等",
        reasoning_chains: [
          "职业压力与冠心病死亡率关联分析 → 长期高压力职业者心血管事件风险↑40%",
          "长期压力 → 偏头痛或紧张性头痛发作频率↑（神经系统功能紊乱）",
          "长期压力 + 睡眠质量下降 → 免疫功能抑制（T细胞活性↓）→ 慢性炎症↑"
        ],
        validation_data: [
          "心率变异性 HRV、皮质醇节律、ASCVD 风险评分",
          "偏头痛频率记录、自主神经测试（如 pupil size, 皮肤电）",
          "T细胞功能指标（如 CD4+/CD8+）、CRP、IL-6 水平"
        ],
        customer_preferences: [
          "💰 中高价位（500–1500元）；偏好非医疗语言的数字反馈服务（如：压力/节律追踪）",
          "💰 中价位（300–800元）；愿尝试物理缓解工具（如热敷/脑放松仪）与自助评估服务",
          "💰 中高价位（600–1200元）；可接受行为调节建议 + 专业解释反馈，但需非侵入式检测"
        ]
      },
      {
        name: "C2 代谢风险预警系统",
        description: "关注因 BMI 超标、久坐、激素紊乱等引起的胰岛素抵抗、脂肪肝、糖尿病前期等代谢异常趋势",
        reasoning_chains: [
          "疲劳 + 睡眠障碍 → 血糖检测（空腹血糖≥6.1）→ 糖调节受损",
          "超重（BMI 25.9）→ 腹腔脂肪堆积 → 胰岛素抵抗风险↑"
        ],
        validation_data: [
          "空腹血糖、餐后2小时血糖、胰岛素、HbA1c",
          "腰围、体脂率、内脏脂肪评分、瘦素/饥饿素水平"
        ],
        customer_preferences: [
          "💰 中高价位（500–1500元）；偏好数字反馈+非诊断化语言",
          "💰 中等价位（300–800元）；偏好轻量级干预，如饮食打卡、减脂体验营"
        ]
      }
    ]
  };

  useEffect(() => {
    loadSystemData();
  }, []);

  const loadSystemData = async () => {
    setLoading(true);
    try {
      // 检查系统状态
      const healthCheck = await healthAPI.healthCheck();
      setSystemStatus(healthCheck);
      
      // 设置Excel案例数据
      setExcelCaseData(mockExcelCaseData);
      
      // 设置健康分析数据
      setHealthAnalysisData({
        hrv_trend: [85, 78, 72, 68, 65],
        sleep_quality: { deep: 25, light: 45, rem: 20, awake: 10 },
        health_metrics: {
          cardiovascular: 75,
          metabolic: 80,
          sleep: 70,
          stress: 65,
          work_life: 60,
          overall: 70
        }
      });
      
      message.success('系统数据加载成功');
    } catch (error) {
      console.error('加载系统数据失败:', error);
      message.error('系统数据加载失败，使用演示数据');
      
      // 使用演示数据
      setSystemStatus({ status: "healthy", message: "演示模式" });
      setExcelCaseData(mockExcelCaseData);
      setHealthAnalysisData({
        hrv_trend: [85, 78, 72, 68, 65],
        sleep_quality: { deep: 25, light: 45, rem: 20, awake: 10 },
        health_metrics: {
          cardiovascular: 75,
          metabolic: 80,
          sleep: 70,
          stress: 65,
          work_life: 60,
          overall: 70
        }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadSystemData();
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" tip="正在加载系统数据..." />
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 系统头部 */}
      <Header className="health-system-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>健康咨询录音需求解析系统</h1>
            <p>基于Excel案例的九步健康需求分析演示</p>
          </div>
          <Space>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              ghost
            >
              刷新数据
            </Button>
            <Button 
              icon={<SettingOutlined />} 
              ghost
            >
              系统设置
            </Button>
          </Space>
        </div>
      </Header>

      {/* 主要内容 */}
      <Content style={{ padding: '24px', background: '#f5f5f5' }}>
        {/* 系统状态提示 */}
        {systemStatus && (
          <Alert
            message="系统状态"
            description={`${systemStatus.message || '系统运行正常'} - ${new Date().toLocaleString()}`}
            type="success"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        {/* 主要内容标签页 */}
        <Tabs 
          defaultActiveKey="overview" 
          size="large"
          items={[
            {
              key: 'overview',
              label: (
                <span>
                  <DashboardOutlined />
                  系统概览
                </span>
              ),
              children: (
                <Row gutter={[24, 24]}>
                  {/* Excel案例卡片 */}
                  <Col span={24}>
                    <ExcelCaseCard caseData={excelCaseData} />
                  </Col>
                </Row>
              )
            },
            {
              key: 'analysis',
              label: (
                <span>
                  <BarChartOutlined />
                  健康分析
                </span>
              ),
              children: <HealthAnalysisChart analysisData={healthAnalysisData} />
            },
            {
              key: 'stages',
              label: (
                <span>
                  <FileTextOutlined />
                  九步分析
                </span>
              ),
              children: (
            <Card title="九步分析流程详解">
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <Card 
                    title="已完成步骤" 
                    size="small"
                    style={{ borderLeft: '4px solid #52c41a' }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong>第一步：数据采集</Text>
                        <br />
                        <Text type="secondary">✅ 音频转写、核心信息提取</Text>
                      </div>
                      <div>
                        <Text strong>第二步：需求评估</Text>
                        <br />
                        <Text type="secondary">✅ 生物医学、心理、社会环境等维度分析</Text>
                      </div>
                      <div>
                        <Text strong>第三步：结果验证</Text>
                        <br />
                        <Text type="secondary">✅ 医学依据验证、个体差异考虑</Text>
                      </div>
                      <div>
                        <Text strong>第四步：框架构建</Text>
                        <br />
                        <Text type="secondary">✅ 构建系统性问题解决框架</Text>
                      </div>
                      <div>
                        <Text strong>第五步：排序</Text>
                        <br />
                        <Text type="secondary">✅ 基于疾病风险、改善程度、客户接受度排序</Text>
                      </div>
                    </Space>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card 
                    title="待完成步骤" 
                    size="small"
                    style={{ borderLeft: '4px solid #faad14' }}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <div>
                        <Text strong>第六步：方案</Text>
                        <br />
                        <Text type="secondary">⏳ 构建树形立体健康管理方案</Text>
                      </div>
                      <div>
                        <Text strong>第七步：个性化</Text>
                        <br />
                        <Text type="secondary">⏳ 结合业务场景输出个性化方案</Text>
                      </div>
                      <div>
                        <Text strong>第八步：动态调整</Text>
                        <br />
                        <Text type="secondary">⏳ 数字人管理方案的动态调整</Text>
                      </div>
                      <div>
                        <Text strong>第九步：效果评估</Text>
                        <br />
                        <Text type="secondary">⏳ 生成定期反馈报告</Text>
                      </div>
                    </Space>
                  </Card>
                </Col>
              </Row>
            </Card>
              )
            }
          ]}
        />
      </Content>
    </Layout>
  );
};

export default Dashboard;
