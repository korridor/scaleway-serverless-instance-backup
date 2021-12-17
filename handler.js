module.exports.handle = (event, context, callback) => {

    const axios = require('axios');

    let zone = process.env.ZONE;
    let token = process.env.TOKEN;
    let volume = process.env.VOLUME_ID;
    let project = process.env.PROJECT_ID;
    let apiUrl = 'https://api.scaleway.com';

    let needsBackup = true;

    axios({
        method: 'get',
        url: '/instance/v1/zones/{zone}/snapshots'.replace('{zone}', zone),
        baseURL: apiUrl,
        headers: {
            'X-Auth-Token': token,
        },
        data: {
            public: false
        },
        responseType: 'json',
    })
        .then(response => {
            let snapshots = response.data.snapshots;
            for (let snapshot of snapshots) {
                if (snapshot.base_volume !== null && volume === snapshot.base_volume.id) {
                    let diff = new Date().getTime() - new Date(snapshot.creation_date).getTime();
                    let dayDiff = diff / 86400000;
                    if (dayDiff >= 7) {
                        axios({
                            method: 'delete',
                            url: '/instance/v1/zones/{zone}/snapshots/{snapshot_id}'
                                .replace('{zone}', zone)
                                .replace('{snapshot_id}', snapshot.id),
                            baseURL: apiUrl,
                            headers: {
                                'X-Auth-Token': token,
                            },
                            data: {
                            },
                            responseType: 'json',
                        })
                            .then(response => {
                                console.log('Snapshot deleted successfully!');
                            }).catch((reason => {
                            console.log('Error during snapshot deletion')
                            console.log(reason);
                        }));
                    }
                    if (needsBackup && dayDiff < 1) {
                        needsBackup = false;
                    }
                }
            }

            if (needsBackup) {
                console.log('Start creating snapshot');
                axios({
                    method: "post",
                    url: "/instance/v1/zones/{zone}/snapshots".replace('{zone}', zone),
                    baseURL: apiUrl,
                    headers: {
                        'X-Auth-Token': token,
                    },
                    data: {
                        'name': 'automatic',
                        'volume_id': volume,
                        'project': project,
                    },
                    responseType: 'json',
                })
                    .then(response => {
                        console.log('Snapshot created successfully!');
                    }).catch((reason => {
                    console.log('Error during snapshot creation')
                    console.log(reason);
                }));
            }

        }).catch((reason => {
        console.log(reason)
    }));

    const response = {
        statusCode: 200,
        body: JSON.stringify({
            message: 'done',
        }),
    };

    // either return cb(undefined, response) or return response
    return response;
};

