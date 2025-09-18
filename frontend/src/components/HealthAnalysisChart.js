import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card, Row, Col, Statistic } from 'antd';
import { HeartOutlined, ThunderboltOutlined, MoonOutlined, MedicineBoxOutlined } from '@ant-design/icons';

const HealthAnalysisChart = ({ analysisData }) => {
  if (!analysisData) {
    return <Card loading={true} />;
  }

  // HRV压力指数变化趋势数据
  const hrvData = {
    title: {
      text: 'HRV压力指数变化趋势',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'axis',
      formatter: function(params) {
        return `时间: ${params[0].axisValue}<br/>HRV指数: ${params[0].value}`;
      }
    },
    xAxis: {
      type: 'category',
      data: ['基线', '第1周', '第2周', '第3周', '第4周'],
      axisLabel: {
        fontSize: 12
      }
    },
    yAxis: {
      type: 'value',
      name: 'HRV指数',
      axisLabel: {
        formatter: '{value}'
      }
    },
    series: [{
      name: 'HRV压力指数',
      type: 'line',
      data: [85, 78, 72, 68, 65],
      smooth: true,
      lineStyle: {
        color: '#1890ff',
        width: 3
      },
      itemStyle: {
        color: '#1890ff'
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [{
            offset: 0, color: 'rgba(24, 144, 255, 0.3)'
          }, {
            offset: 1, color: 'rgba(24, 144, 255, 0.1)'
          }]
        }
      }
    }]
  };

  // 睡眠质量改善数据
  const sleepData = {
    title: {
      text: '睡眠质量改善情况',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c}% ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: ['深度睡眠', '浅度睡眠', '快速眼动睡眠', '清醒时间']
    },
    series: [{
      name: '睡眠质量',
      type: 'pie',
      radius: ['40%', '70%'],
      center: ['60%', '50%'],
      data: [
        { value: 25, name: '深度睡眠', itemStyle: { color: '#52c41a' } },
        { value: 45, name: '浅度睡眠', itemStyle: { color: '#1890ff' } },
        { value: 20, name: '快速眼动睡眠', itemStyle: { color: '#faad14' } },
        { value: 10, name: '清醒时间', itemStyle: { color: '#f5222d' } }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  };

  // 健康指标雷达图
  const radarData = {
    title: {
      text: '多维度健康评估',
      left: 'center',
      textStyle: {
        fontSize: 16,
        fontWeight: 'bold'
      }
    },
    radar: {
      indicator: [
        { name: '心血管健康', max: 100 },
        { name: '代谢健康', max: 100 },
        { name: '睡眠质量', max: 100 },
        { name: '压力管理', max: 100 },
        { name: '工作生活平衡', max: 100 },
        { name: '整体健康', max: 100 }
      ],
      center: ['50%', '60%'],
      radius: '60%'
    },
    series: [{
      name: '健康指标',
      type: 'radar',
      data: [{
        value: [75, 80, 70, 65, 60, 70],
        name: '当前状态',
        itemStyle: {
          color: '#1890ff'
        },
        areaStyle: {
          color: 'rgba(24, 144, 255, 0.2)'
        }
      }, {
        value: [85, 90, 85, 80, 75, 85],
        name: '目标状态',
        itemStyle: {
          color: '#52c41a'
        },
        areaStyle: {
          color: 'rgba(82, 196, 26, 0.2)'
        }
      }]
    }]
  };

  return (
    <div>
      <Row gutter={[16, 16]}>
        {/* 关键指标统计 */}
        <Col span={24}>
          <Card title="关键健康指标" style={{ marginBottom: 16 }}>
            <Row gutter={[16, 16]}>
              <Col span={6}>
                <Statistic
                  title="HRV压力指数"
                  value={65}
                  suffix="分"
                  prefix={<ThunderboltOutlined style={{ color: '#1890ff' }} />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="睡眠效率"
                  value={75}
                  suffix="%"
                  prefix={<MoonOutlined style={{ color: '#52c41a' }} />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="心血管风险"
                  value={15}
                  suffix="%"
                  prefix={<HeartOutlined style={{ color: '#faad14' }} />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Col>
              <Col span={6}>
                <Statistic
                  title="代谢风险"
                  value={20}
                  suffix="%"
                  prefix={<MedicineBoxOutlined style={{ color: '#f5222d' }} />}
                  valueStyle={{ color: '#f5222d' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* HRV压力指数趋势 */}
        <Col span={12}>
          <Card title="HRV压力指数变化趋势" className="metrics-chart">
            <ReactECharts 
              option={hrvData} 
              style={{ height: '300px' }}
            />
          </Card>
        </Col>

        {/* 睡眠质量改善 */}
        <Col span={12}>
          <Card title="睡眠质量改善情况" className="metrics-chart">
            <ReactECharts 
              option={sleepData} 
              style={{ height: '300px' }}
            />
          </Card>
        </Col>

        {/* 多维度健康评估 */}
        <Col span={24}>
          <Card title="多维度健康评估雷达图" className="metrics-chart">
            <ReactECharts 
              option={radarData} 
              style={{ height: '400px' }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default HealthAnalysisChart;
