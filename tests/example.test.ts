
import * as cron from 'node-cron';
import { config } from 'dotenv';
import { QosNetwork, QosStatus } from '../src/shared/enums';
import { Qos } from '../src';

config();

export interface MomoPaymentDto {
    phone: string;
    amount: number;
    network: string;
    firstname?: string;
    lastname?: string;
}

const qosService = new Qos(
    process.env.QOS_MTN_BJ_CLIENT_ID as string,
    process.env.QOS_MOOV_BJ_CLIEND_ID as string,
    process.env.QOS_USERNAME as string,
    process.env.QOS_PASSWORD as string
);

async function momoPayment(data: MomoPaymentDto): Promise<any> {
    const phone = data.phone;
    const amount = data.amount;
    const network = data.network == 'mtn' ? QosNetwork.MTN : QosNetwork.MOOV;

    let transref = await qosService.makePayment(phone, amount, network);
    let paymentStatus = await qosService.getStatus(transref!, network);
    let retryTime = 0;


    /// jsut to define the number of time your app have to check status until
    /// stopped and declare this one as error
    /// TL;DR: This thing could be avoided it Qos provide us a webhook

    const authorizedRetryTime = 7;



    /// */15 refers to the number of seconds to wait before asking
    /// the next transaction status
    const task = cron.schedule("*/15 * * * * *", async () => {
        paymentStatus = await qosService.getStatus(transref!, network);

        switch (paymentStatus) {
            case QosStatus.pending:
                retryTime++;
                break;
            case QosStatus.successful:
                task.stop();
                break;
            default:
                break;
        }

        if (paymentStatus != QosStatus.pending && paymentStatus != QosStatus.successful) {
            task.stop();

            console.log({
                transactionRef: transref,
                transactionStatus: QosStatus.failed,
                errors: "Momo payment failed.",
                infos: data,
            });


        }
        if (retryTime >= authorizedRetryTime && paymentStatus != QosStatus.successful) {
            task.stop();

            console.log({
                transactionRef: transref,
                transactionStatus: QosStatus.failed,
                errors: "Retry time exceeded",
            });
        }

        if (paymentStatus == QosStatus.successful) {

            console.log({
                transactionRef: transref,
                transactionStatus: paymentStatus,
            });

            task.stop();
        }
    });

}

momoPayment(
    {
        phone: '22966478052',
        amount: 1,
        network: QosNetwork.MTN
    }
).then((value) => {
    console.log(value);
}).catch((error) => {
    console.log(`An error occured: ${error}`);
});