import React, { useEffect } from 'react';
import echarts from 'echarts/lib/echarts';
import 'echarts/lib/chart/pie';
import 'echarts/lib/component/tooltip';
import 'echarts/lib/component/title';
import 'echarts/lib/component/legend';

const Pie = props => {
    const { data } = props;
    useEffect(() => {
        const pending = data.filter(item => item.status === 0);
        const resolved = data.filter(item => item.status === 1);
        const discarded = data.filter(item => item.status === 2);

        let myChart = echarts.init(document.getElementById('pie'));
        myChart.setOption({
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b} : {c} ({d}%)'
            },
            // legend: {
            //     orient: 'vertical',
            //     left: 'left',
            //     data: ['待处理', '已解决', '无需解决']
            // },
            series: [
                {
                    name: '反馈类型',
                    type: 'pie',
                    radius: '80%',
                    center: ['50%', '60%'],
                    data: [
                        { value: pending.length, name: '待处理' },
                        { value: resolved.length, name: '已解决' },
                        { value: discarded.length, name: '无需解决' }
                    ],
                    itemStyle: {
                        emphasis: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        });
        window.addEventListener('resize', function() {
            myChart.resize();
        });
    }, []);

    return <div id='pie' style={{ height: 120 }}></div>;
};

export default Pie;
