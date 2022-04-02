import React, { useEffect } from 'react';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/line';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';

const Line = props => {
    const { data } = props;
    useEffect(() => {
        let myChart = echarts.init(document.getElementById('line'));
        myChart.setOption({
            tooltip: {
                trigger: 'axis'
            },
            legend: {
                data: ['后勤报修', '网络报修', '优化建议', '其他']
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
            },
            yAxis: {
                type: 'value'
            },
            series: [
                {
                    name: '后勤报修',
                    type: 'line',
                    data: [12, 13, 11, 34, 9, 23, 21]
                },
                {
                    name: '网络报修',
                    type: 'line',
                    data: [22, 18, 19, 23, 29, 23, 10]
                },
                {
                    name: '优化建议',
                    type: 'line',
                    data: [10, 22, 21, 14, 19, 30, 10]
                },
                {
                    name: '其他',
                    type: 'line',
                    data: [15, 32, 21, 14, 10, 20, 18]
                }
            ]
        });
        window.addEventListener('resize', function() {
            myChart.resize();
        });
    }, []);

    return <div id='line' style={{ height: 200 }}></div>;
};

export default Line;
