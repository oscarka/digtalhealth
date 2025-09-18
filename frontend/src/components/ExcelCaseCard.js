import React from 'react';
import { Card, Tag, Typography, Row, Col, Statistic, Progress, Timeline, Divider } from 'antd';
import { 
  UserOutlined, 
  HeartOutlined, 
  MoonOutlined, 
  ThunderboltOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MedicineBoxOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;

const ExcelCaseCard = ({ caseData }) => {
  if (!caseData) {
    return <Card loading={true} />;
  }

  const basicInfo = caseData.basic_info || {};
  const symptoms = caseData.symptoms || [];
  const modules = caseData.health_modules || [];

  return (
    <Card 
      className="excel-case-card"
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <UserOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          <span>Excel案例：{basicInfo.full_name || '李工程师'}</span>
        </div>
      }
      extra={<Tag color="blue">Excel案例</Tag>}
    >
      {/* 基本信息 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Statistic 
            title="年龄" 
            value={basicInfo.age || '42'} 
            suffix="岁"
            prefix={<UserOutlined />}
          />
        </Col>
        <Col span={6}>
          <Statistic 
            title="BMI" 
            value={basicInfo.bmi || '25.9'} 
            prefix={<HeartOutlined />}
          />
        </Col>
        <Col span={6}>
          <Statistic 
            title="身高" 
            value={basicInfo.height || '178cm'} 
            prefix={<UserOutlined />}
          />
        </Col>
        <Col span={6}>
          <Statistic 
            title="体重" 
            value={basicInfo.weight || '82kg'} 
            prefix={<HeartOutlined />}
          />
        </Col>
      </Row>

      {/* 症状标签 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={5}>主要症状</Title>
        <div>
          {symptoms.map((symptom, index) => (
            <Tag 
              key={index} 
              color={index === 0 ? 'red' : index === 1 ? 'orange' : 'yellow'}
              icon={<ThunderboltOutlined />}
            >
              {symptom.description || symptom}
            </Tag>
          ))}
        </div>
      </div>

      {/* 健康模块 */}
      <div style={{ marginBottom: 24 }}>
        <Title level={5}>健康管理模块</Title>
        {modules.map((module, index) => (
          <Card 
            key={index}
            size="small" 
            style={{ marginBottom: 16, borderLeft: `4px solid ${index === 0 ? '#52c41a' : '#1890ff'}` }}
            title={
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {index === 0 ? <MoonOutlined /> : <MedicineBoxOutlined />}
                <span style={{ marginLeft: 8 }}>{module.name}</span>
              </div>
            }
          >
            <Paragraph style={{ marginBottom: 12 }}>
              {module.description}
            </Paragraph>
            
            {/* 推理链路 */}
            <div style={{ marginBottom: 12 }}>
              <Text strong>推理链路：</Text>
              {module.reasoning_chains?.map((chain, chainIndex) => (
                <div key={chainIndex} className="reasoning-chain">
                  {chain}
                </div>
              ))}
            </div>

            {/* 验证数据 */}
            <div style={{ marginBottom: 12 }}>
              <Text strong>验证数据：</Text>
              <div>
                {module.validation_data?.map((data, dataIndex) => (
                  <Tag key={dataIndex} color="blue" style={{ margin: 2 }}>
                    {data}
                  </Tag>
                ))}
              </div>
            </div>

            {/* 客户偏好 */}
            <div>
              <Text strong>客户偏好：</Text>
              {module.customer_preferences?.map((pref, prefIndex) => (
                <div key={prefIndex} className="customer-preference">
                  {pref}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      {/* 九阶段分析进度 */}
      <div>
        <Title level={5}>九步分析进度</Title>
        <Timeline
          items={[
            {
              dot: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
              color: 'green',
              children: (
                <>
                  <Text strong>第一步：数据采集</Text>
                  <br />
                  <Text type="secondary">音频转写、核心信息提取</Text>
                </>
              )
            },
            {
              dot: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
              color: 'green',
              children: (
                <>
                  <Text strong>第二步：需求评估</Text>
                  <br />
                  <Text type="secondary">生物医学、心理、社会环境等维度分析</Text>
                </>
              )
            },
            {
              dot: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
              color: 'green',
              children: (
                <>
                  <Text strong>第三步：结果验证</Text>
                  <br />
                  <Text type="secondary">医学依据验证、个体差异考虑</Text>
                </>
              )
            },
            {
              dot: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
              color: 'green',
              children: (
                <>
                  <Text strong>第四步：框架构建</Text>
                  <br />
                  <Text type="secondary">构建系统性问题解决框架</Text>
                </>
              )
            },
            {
              dot: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
              color: 'green',
              children: (
                <>
                  <Text strong>第五步：排序</Text>
                  <br />
                  <Text type="secondary">基于疾病风险、改善程度、客户接受度排序</Text>
                </>
              )
            },
            {
              dot: <ClockCircleOutlined style={{ color: '#faad14' }} />,
              color: 'orange',
              children: (
                <>
                  <Text strong>第六步：方案</Text>
                  <br />
                  <Text type="secondary">构建树形立体健康管理方案</Text>
                </>
              )
            },
            {
              dot: <ClockCircleOutlined style={{ color: '#faad14' }} />,
              color: 'orange',
              children: (
                <>
                  <Text strong>第七步：个性化</Text>
                  <br />
                  <Text type="secondary">结合业务场景输出个性化方案</Text>
                </>
              )
            },
            {
              dot: <ClockCircleOutlined style={{ color: '#faad14' }} />,
              color: 'orange',
              children: (
                <>
                  <Text strong>第八步：动态调整</Text>
                  <br />
                  <Text type="secondary">数字人管理方案的动态调整</Text>
                </>
              )
            },
            {
              dot: <ClockCircleOutlined style={{ color: '#faad14' }} />,
              color: 'orange',
              children: (
                <>
                  <Text strong>第九步：效果评估</Text>
                  <br />
                  <Text type="secondary">效果评估</Text>
                </>
              )
            }
          ]}
        />
      </div>
    </Card>
  );
};

export default ExcelCaseCard;
