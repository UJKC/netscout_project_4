import React from 'react';
import { Matcher } from '../utility/Match'
import CodeEditor from './CodeEditor';
import LC from './LastChecker';

const Dupli = ({ cacheData }) => {
    console.log("Here from SDD by APP. Transforming data into json and objects");

    const IDS_GEOLOCATION_OPTION = cacheData.IDS_GEOLOCATION.map(country =>
        Matcher(Object.values(country)[0], 'Geolocation', Object.keys(country)[0])
    );

    const IDS_APPLICATION_OPTION = cacheData.IDS_APPLICATIONS.map(appli =>
        Matcher(appli.shortName, 'Application', appli.appId)
    );

    const IDS_HOST_OPTION = cacheData.IDS_HOST.map(host =>
        Matcher(host, 'Host', host)
    );

    const IDS_HOST_GROUP_OPTION = cacheData.IDS_HOST_GROUP.map(host_group =>
        Matcher(host_group.hostGroupName, "Host Group", host_group.hostGroup)
    );

    const IDS_PORT_OPTION = cacheData.IDS_PORT.map(port =>
        Matcher(port, 'Port', port)
    );

    // Structure the data as an object
    const options = {
        "Host":IDS_HOST_OPTION,
        "Host_Group":IDS_HOST_GROUP_OPTION,
        "Geolocation":IDS_GEOLOCATION_OPTION,
        "Application":IDS_APPLICATION_OPTION,
        "Port":IDS_PORT_OPTION
    };

    return (
        <>
            <LC options={options} />
        </>
    );
};

export default Dupli;
