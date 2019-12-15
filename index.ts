import * as core from "@actions/core";
import { IncomingWebhook } from "@slack/webhook";
import axios from "axios";
import * as qs from "querystring";

(async () => {
  // Validate parameters
  const [ productId, scheduleId, seatId, webhookUrl ] = [
    "product-id",
    "schedule-id",
    "seat-id",
    "slack-incoming-webhook-url",
  ].map((name) => {
    const value = core.getInput(name);
    if (!value) {
      throw new Error(`melon-ticket-actions: Please set ${name} input parameter`);
    }

    return value;
  });

  const webhook = new IncomingWebhook(webhookUrl);

  const res = await axios({
    method: "GET",
    url: "https://ticket.melon.com/tktapi/product/seatStateInfo.json",
    params: {
      v: "1",
    },
    data: qs.stringify({
      prodId: productId,
      scheduleNo: scheduleId,
      seatId,
      volume: 1,
      selectedGradeVolume: 1,
    }),
  });

  // tslint:disable-next-line
  console.log(res.data);

  if (res.data.chkResult) {
    const link = `http://ticket.melon.com/performance/index.htm${qs.stringify({
      prodId: 204755,
    })}`;

    await webhook.send(`티켓사세요 ${link}`);
  }
})().catch((e) => {
  console.error(e.stack); // tslint:disable-line
  core.setFailed(e.message);
});