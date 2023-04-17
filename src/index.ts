import axios, { AxiosInstance } from "axios";
import { QosNetwork } from "./shared/enums";


export class Qos {

    private axiosInstance: AxiosInstance;


    constructor(
        public QosMtnKey: string,
        public QosMoovKey: string,
        public QosUsername: string,
        public QosPassword: string,
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


    private makeid(length: number): string {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() *
                charactersLength));
        }
        return result;
    }

    public async makePayment(phoneNumber: string, amount: number, network: QosNetwork) {
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
                .then((response: { data: { transref: any; }; }) => {
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
            throw new Error(error);
        }

        return transactionRef;
    }

    public async makeDeposit(phoneNumber: string, amount: number, network: QosNetwork) {
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
                .then((response: { data: { transref: any; }; }) => {
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
            throw new Error(error);
        }

        return transactionRef;
    }

    public async makeRefund(transref: string, network: QosNetwork) {
        let response = null;

        try {
            await this.axiosInstance
                .post("/refund", {
                    transref: transref,
                    clientid:
                        network === QosNetwork.MTN
                            ? this.QosMtnKey
                            : this.QosMoovKey
                })
                .then((resp: { data: { responsemsg: any; }; }) => {
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
            throw new Error(error);
        }
        return response;
    }

    public async getStatus(transref: string, network: QosNetwork) {
        let status = '';

        try {
            await this.axiosInstance
                .post("/gettransactionstatus", {
                    transref: transref,
                    clientid:
                        network === QosNetwork.MTN
                            ? this.QosMtnKey
                            : this.QosMoovKey
                })
                .then((response: { data: { responsemsg: any; }; }) => {
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
            throw new Error(error);
        }
        return status;
    }
}


