import React, { useState } from 'react';
import UniNewsCardList from './card-list';
import UniNewsTable from './table';
import NewsInfoModal from '../news-info-modal';

export default function UniNewsTab(props) {
    const { isPreview, data, onUpdate } = props;
    const [visible, setVisible] = useState(false);
    const [infoData, setInfoData] = useState({});

    const uniData = data?.filter(item => item?.publish_depart === 'university');

    const onModalShow = data => {
        setInfoData(data);
        setVisible(true);
    };

    return (
        <div>
            {isPreview ? (
                <UniNewsCardList data={uniData} onUpdate={onUpdate} onModalShow={onModalShow} />
            ) : (
                <UniNewsTable data={uniData} onUpdate={onUpdate} onModalShow={onModalShow} />
            )}
            <NewsInfoModal
                visible={visible}
                data={infoData}
                currentTab='university'
                onCancel={() => setVisible(false)}
            />
        </div>
    );
}
