import axios, { AxiosInstance } from "axios";


enum QosNetwork {
    MTN = "mtn",
    MOOV = "moov",
}

class Qos {
   
    constructor(
        public QosMtnKey: String,
        public QosMoovKey: String,
        public QosUsername: String,
        public QosPassword: String,
    ) {
        this.axiosInstance = axios.create({
            baseURL: "https://qosic.net:8443/QosicBridge/user",
            headers: {
                "Content-Type": "application/json",
                Authorization:
                    "Basic " +
                    Buffer.from(
                        QosUsername + ":" + QosPassword
                    ).toString("base64"),
            },
        });
    }

    private axiosInstance: AxiosInstance;

    private makeid(length: Number): String {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    }

    public async makePayment(phoneNumber: String, amount: Number, network: QosNetwork) {
        let transactionRef = null;

        try {
            await this.axiosInstance
                .post("/requestpayment", {
                    msisdn: phoneNumber,
                    amount: amount,
                    transref: this.makeid(10),
                    clientid:
                        network === QosNetwork.MTN
                            ? this.QosMtnKey
                            : this.QosMoovKey
                })
                .then((response) => {
                    transactionRef = response.data.transref;
                });
        } catch (error: any) {
            console.log(
                `An error occured: [` +
                error.response.status +
                ` : ` +
                error.response.statusText +
                `]`
            );
            console.log(error.config);
        }

        return transactionRef;
    }

    public async makeDeposit(phoneNumber: String, amount: Number, network: QosNetwork) {
        let transactionRef = null;

        try {
            await this.axiosInstance
                .post("/deposit", {
                    msisdn: phoneNumber,
                    amount: amount,
                    transref: this.makeid(10),
                    clientid:
                        network === QosNetwork.MTN
                            ? this.QosMtnKey
                            : this.QosMoovKey
                })
                .then((response) => {
                    // console.log(response.data.transref);

                    transactionRef = response.data.transref;
                });
        } catch (error: any) {
            console.log(
                `An error occured: [` +
                error.response.status +
                ` : ` +
                error.response.statusText +
                `]`
            );
            console.log(error.config);
        }

        return transactionRef;
    }

    public async makeRefund(transref: String, network: QosNetwork) {
        let response = null;

        try {
            await this.axiosInstance
                .post("/refund", {
                    transref: transref,
                    clientid:
                        network === QosNetwork.MTN
                            ? process.env.QOS_MTN_CLIENT_ID
                            : process.env.QOS_MOOV_CLIENT_ID,
                })
                .then((resp) => {
                    response = resp.data.responsemsg;
                });
        } catch (error: any) {
            console.log(
                `An error occured: [` +
                error.response.status +
                ` : ` +
                error.response.statusText +
                `]`
            );
            console.log(error.config);
        }
        return response;
    }

    public async getStatus(transref: String, network: QosNetwork) {
        let status = null;

        try {
            await this.axiosInstance
                .post("/gettransactionstatus", {
                    transref: transref,
                    clientid:
                        network === QosNetwork.MTN
                            ? this.QosMtnKey
                            : this.QosMoovKey
                })
                .then((response) => {
                    status = response.data.responsemsg;
                });
        } catch (error: any) {
            console.log(
                `An error occured: [` +
                error.response.status +
                ` : ` +
                error.response.statusText +
                `]`
            );
            console.log(error.config);
        }
        return status;
    }
}


const qosInstance = new Qos("ImoneroCJL", "ImoneroDMV", "QSUSR515", "Kd9dcOxySm58ARge31A8");

qosInstance.makePayment("22966478052", 1, QosNetwork.MTN).then((value) => {
    console.log(value);

}); 