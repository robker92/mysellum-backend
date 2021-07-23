import { FRONTEND_BASE_URL } from '../../config';
import {
    mysellumAtt,
    facebookAtt,
    instagramAtt,
    linkedinAtt,
    twitterAtt,
} from './baseAttachments';

export {
    getContentOrderCreatedCustomer,
    subjectOrderCreatedCustomer,
    attachmentsOrderCreatedCustomer,
};

const subjectOrderCreatedCustomer = 'Order Received';

const attachmentsOrderCreatedCustomer = [
    mysellumAtt,
    facebookAtt,
    instagramAtt,
    linkedinAtt,
    twitterAtt,
];

function getContentOrderCreatedCustomer2(options) {
    let htmlBody = `<b>Hello Customer</b><br/> <br/> 
    thank you for your order! It will be transferred to the store.`;
    return htmlBody;
}

function getContentOrderCreatedCustomer(options) {
    let htmlBody = `
    <!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">

    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office"
        xmlns:v="urn:schemas-microsoft-com:vml">

    <head>
        <!--[if gte mso 9]><xml><o:OfficeDocumentSettings><o:AllowPNG/><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml><![endif]-->
        <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
        <meta content="width=device-width" name="viewport" />
        <!--[if !mso]><!-->
        <meta content="IE=edge" http-equiv="X-UA-Compatible" />
        <!--<![endif]-->
        <title></title>
        <!--[if !mso]><!-->
        <link href="https://fonts.googleapis.com/css?family=Bitter" rel="stylesheet" type="text/css" />
        <link href="https://fonts.googleapis.com/css?family=Cormorant+Garamond" rel="stylesheet" type="text/css" />
        <link href="https://fonts.googleapis.com/css?family=Cabin" rel="stylesheet" type="text/css" />
        <link href="https://fonts.googleapis.com/css?family=Droid+Serif" rel="stylesheet" type="text/css" />
        <link href="https://fonts.googleapis.com/css?family=Montserrat" rel="stylesheet" type="text/css" />
        <link href="https://fonts.googleapis.com/css?family=Roboto+Slab" rel="stylesheet" type="text/css" />
        <!--<![endif]-->
        <style type="text/css">
            body {
                margin: 0;
                padding: 0;
            }

            table,
            td,
            tr {
                vertical-align: top;
                border-collapse: collapse;
            }

            * {
                line-height: inherit;
            }

            a[x-apple-data-detectors=true] {
                color: inherit !important;
                text-decoration: none !important;
            }
        </style>
        <style id="media-query" type="text/css">
            @media (max-width: 670px) {

                .block-grid,
                .col {
                    min-width: 320px !important;
                    max-width: 100% !important;
                    display: block !important;
                }

                .block-grid {
                    width: 100% !important;
                }

                .col {
                    width: 100% !important;
                }

                .col_cont {
                    margin: 0 auto;
                }

                img.fullwidth,
                img.fullwidthOnMobile {
                    max-width: 100% !important;
                }

                .no-stack .col {
                    min-width: 0 !important;
                    display: table-cell !important;
                }

                .no-stack.two-up .col {
                    width: 50% !important;
                }

                .no-stack .col.num2 {
                    width: 16.6% !important;
                }

                .no-stack .col.num3 {
                    width: 25% !important;
                }

                .no-stack .col.num4 {
                    width: 33% !important;
                }

                .no-stack .col.num5 {
                    width: 41.6% !important;
                }

                .no-stack .col.num6 {
                    width: 50% !important;
                }

                .no-stack .col.num7 {
                    width: 58.3% !important;
                }

                .no-stack .col.num8 {
                    width: 66.6% !important;
                }

                .no-stack .col.num9 {
                    width: 75% !important;
                }

                .no-stack .col.num10 {
                    width: 83.3% !important;
                }

                .video-block {
                    max-width: none !important;
                }

                .mobile_hide {
                    min-height: 0px;
                    max-height: 0px;
                    max-width: 0px;
                    display: none;
                    overflow: hidden;
                    font-size: 0px;
                }

                .desktop_hide {
                    display: block !important;
                    max-height: none !important;
                }
            }
        </style>
        <style id="icon-media-query" type="text/css">
            @media (max-width: 670px) {
                .icons-inner {
                    text-align: center;
                }

                .icons-inner td {
                    margin: 0 auto;
                }
            }
        </style>
    </head>

    <body class="clean-body" style="margin: 0; padding: 0; -webkit-text-size-adjust: 100%; background-color: #85a4cd;">
        <!--[if IE]><div class="ie-browser"><![endif]-->
        <table bgcolor="#85a4cd" cellpadding="0" cellspacing="0" class="nl-container" role="presentation"
            style="table-layout: fixed; vertical-align: top; min-width: 320px; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #85a4cd; width: 100%;"
            valign="top" width="100%">
            <tbody>
                <tr style="vertical-align: top;" valign="top">
                    <td style="word-break: break-word; vertical-align: top;" valign="top">
                        <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color:#85a4cd"><![endif]-->
                        <div style="background-color:#f3f6fe;">
                            <div class="block-grid"
                                style="min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; Margin: 0 auto; background-color: transparent;">
                                <div
                                    style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;">
                                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f6fe;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px"><tr class="layout-full-width" style="background-color:transparent"><![endif]-->
                                    <!--[if (mso)|(IE)]><td align="center" width="650" style="background-color:transparent;width:650px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:15px; padding-bottom:15px;"><![endif]-->
                                    <div class="col num12"
                                        style="min-width: 320px; max-width: 650px; display: table-cell; vertical-align: top; width: 650px;">
                                        <div class="col_cont" style="width:100% !important;">
                                            <!--[if (!mso)&(!IE)]><!-->
                                            <div
                                                style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:15px; padding-bottom:15px; padding-right: 0px; padding-left: 0px;">
                                                <!--<![endif]-->
                                                <div align="center" class="img-container center autowidth"
                                                    style="padding-right: 0px;padding-left: 0px;">
                                                    <!--[if mso]><table width="50%" cellpadding="0" cellspacing="0" border="0"><tr style="line-height:0px"><td style="padding-right: 0px;padding-left: 0px;" align="center"><![endif]--><img
                                                        align="center" alt="Mysellum" border="0" class="center autowidth"
                                                        src="cid:mysellum_logo"
                                                        style="text-decoration: none; -ms-interpolation-mode: bicubic; height: auto; border: 0; width: 100%; max-width: 140px; display: block;"
                                                        title="Mysellum" width="140" />
                                                    <!--[if mso]></td></tr></table><![endif]-->
                                                </div>
                                                <!--[if (!mso)&(!IE)]><!-->
                                            </div>
                                            <!--<![endif]-->
                                        </div>
                                    </div>
                                    <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                                    <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
                                </div>
                            </div>
                        </div>
                        <div style="background-color:transparent;">
                            <div class="block-grid"
                                style="min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; Margin: 0 auto; background-color: transparent;">
                                <div
                                    style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;">
                                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:transparent;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px"><tr class="layout-full-width" style="background-color:transparent"><![endif]-->
                                    <!--[if (mso)|(IE)]><td align="center" width="650" style="background-color:transparent;width:650px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:5px; padding-bottom:5px;"><![endif]-->
                                    <div class="col num12"
                                        style="min-width: 320px; max-width: 650px; display: table-cell; vertical-align: top; width: 650px;">
                                        <div class="col_cont" style="width:100% !important;">
                                            <!--[if (!mso)&(!IE)]><!-->
                                            <div
                                                style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:5px; padding-bottom:5px; padding-right: 0px; padding-left: 0px;">
                                                <!--<![endif]-->
                                                <table border="0" cellpadding="0" cellspacing="0" class="divider"
                                                    role="presentation"
                                                    style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"
                                                    valign="top" width="100%">
                                                    <tbody>
                                                        <tr style="vertical-align: top;" valign="top">
                                                            <td class="divider_inner"
                                                                style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 30px; padding-right: 30px; padding-bottom: 30px; padding-left: 30px;"
                                                                valign="top">
                                                                <table align="center" border="0" cellpadding="0"
                                                                    cellspacing="0" class="divider_content" height="0"
                                                                    role="presentation"
                                                                    style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-top: 0px solid transparent; height: 0px; width: 100%;"
                                                                    valign="top" width="100%">
                                                                    <tbody>
                                                                        <tr style="vertical-align: top;" valign="top">
                                                                            <td height="0"
                                                                                style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"
                                                                                valign="top"><span></span></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <table cellpadding="0" cellspacing="0" role="presentation"
                                                    style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
                                                    valign="top" width="100%">
                                                    <tr style="vertical-align: top;" valign="top">
                                                        <td align="center"
                                                            style="word-break: break-word; vertical-align: top; padding-bottom: 10px; padding-left: 0px; padding-right: 0px; padding-top: 0px; text-align: center; width: 100%;"
                                                            valign="top" width="100%">
                                                            <h1
                                                                style="color:#ffffff;direction:ltr;font-family:'Roboto Slab', Arial, 'Helvetica Neue', Helvetica, sans-serif;font-size:30px;font-weight:normal;letter-spacing:2px;line-height:120%;text-align:center;margin-top:0;margin-bottom:0;">
                                                                <strong>Order Confirmation</strong></h1>
                                                        </td>
                                                    </tr>
                                                </table>
                                                <table border="0" cellpadding="0" cellspacing="0" class="divider"
                                                    role="presentation"
                                                    style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"
                                                    valign="top" width="100%">
                                                    <tbody>
                                                        <tr style="vertical-align: top;" valign="top">
                                                            <td class="divider_inner"
                                                                style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px;"
                                                                valign="top">
                                                                <table align="center" border="0" cellpadding="0"
                                                                    cellspacing="0" class="divider_content" height="0"
                                                                    role="presentation"
                                                                    style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-top: 0px solid transparent; height: 0px; width: 100%;"
                                                                    valign="top" width="100%">
                                                                    <tbody>
                                                                        <tr style="vertical-align: top;" valign="top">
                                                                            <td height="0"
                                                                                style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"
                                                                                valign="top"><span></span></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 5px; padding-bottom: 5px; font-family: Arial, sans-serif"><![endif]-->
                                                <div
                                                    style="color:#3f4d75;font-family:Roboto Slab, Arial, Helvetica Neue, Helvetica, sans-serif;line-height:1.2;padding-top:5px;padding-right:10px;padding-bottom:5px;padding-left:10px;">
                                                    <div class="txtTinyMce-wrapper"
                                                        style="font-size: 14px; line-height: 1.2; color: #3f4d75; font-family: Roboto Slab, Arial, Helvetica Neue, Helvetica, sans-serif; mso-line-height-alt: 17px;">
                                                        <p
                                                            style="margin: 0; font-size: 20px; line-height: 1.2; word-break: break-word; text-align: center; mso-line-height-alt: 24px; margin-top: 0; margin-bottom: 0;">
                                                            <span style="font-size: 20px;">congratulations! Your order was successfully forwarded to the stores. You will hear from us again as soon as they are in delivery or ready to be picked up.
                                                            You can view your order using the link below.</span></p>
                                                    </div>
                                                </div>
                                                <!--[if mso]></td></tr></table><![endif]-->
                                                <table border="0" cellpadding="0" cellspacing="0" class="divider"
                                                    role="presentation"
                                                    style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"
                                                    valign="top" width="100%">
                                                    <tbody>
                                                        <tr style="vertical-align: top;" valign="top">
                                                            <td class="divider_inner"
                                                                style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px;"
                                                                valign="top">
                                                                <table align="center" border="0" cellpadding="0"
                                                                    cellspacing="0" class="divider_content" height="0"
                                                                    role="presentation"
                                                                    style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-top: 0px solid transparent; height: 0px; width: 100%;"
                                                                    valign="top" width="100%">
                                                                    <tbody>
                                                                        <tr style="vertical-align: top;" valign="top">
                                                                            <td height="0"
                                                                                style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"
                                                                                valign="top"><span></span></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <div align="center" class="button-container"
                                                    style="padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;">
                                                    <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-spacing: 0; border-collapse: collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;"><tr><td style="padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px" align="center"><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="www.example.com" style="height:45pt;width:224.25pt;v-text-anchor:middle;" arcsize="17%" strokeweight="1.5pt" strokecolor="#3F4D75" fillcolor="#ffffff"><w:anchorlock/><v:textbox inset="0,0,0,0"><center style="color:#3f4d75; font-family:Arial, sans-serif; font-size:18px"><![endif]-->
                                                    <a
                                                        href="${FRONTEND_BASE_URL}/customer-order-overview/${options.orderId}"
                                                        style="-webkit-text-size-adjust: none; text-decoration: none; display: inline-block; color: #3f4d75; background-color: #ffffff; border-radius: 10px; -webkit-border-radius: 10px; -moz-border-radius: 10px; width: auto; width: auto; border-top: 2px solid #3F4D75; border-right: 2px solid #3F4D75; border-bottom: 2px solid #3F4D75; border-left: 2px solid #3F4D75; padding-top: 10px; padding-bottom: 10px; font-family: Roboto Slab, Arial, Helvetica Neue, Helvetica, sans-serif; text-align: center; mso-border-alt: none; word-break: keep-all;"
                                                        target="_blank"><span
                                                            style="padding-left:25px;padding-right:25px;font-size:18px;display:inline-block;letter-spacing:undefined;"><span
                                                                style="font-size: 16px; line-height: 2; word-break: break-word; mso-line-height-alt: 32px;"><span
                                                                    data-mce-style="font-size: 18px; line-height: 36px;"
                                                                    style="font-size: 18px; line-height: 36px;">View Your Order</span></span></span></a>

                                                                    
                                                    <!--[if mso]></center></v:textbox></v:roundrect></td></tr></table><![endif]-->
                                                </div>
                                                <table border="0" cellpadding="0" cellspacing="0" class="divider"
                                                    role="presentation"
                                                    style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"
                                                    valign="top" width="100%">
                                                    <tbody>
                                                        <tr style="vertical-align: top;" valign="top">
                                                            <td class="divider_inner"
                                                                style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px;"
                                                                valign="top">
                                                                <table align="center" border="0" cellpadding="0"
                                                                    cellspacing="0" class="divider_content" height="0"
                                                                    role="presentation"
                                                                    style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-top: 0px solid transparent; height: 0px; width: 100%;"
                                                                    valign="top" width="100%">
                                                                    <tbody>
                                                                        <tr style="vertical-align: top;" valign="top">
                                                                            <td height="0"
                                                                                style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"
                                                                                valign="top"><span></span></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>

                                                <table border="0" cellpadding="0" cellspacing="0" class="divider"
                                                    role="presentation"
                                                    style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"
                                                    valign="top" width="100%">
                                                    <tbody>
                                                        <tr style="vertical-align: top;" valign="top">
                                                            <td class="divider_inner"
                                                                style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 15px; padding-right: 15px; padding-bottom: 15px; padding-left: 15px;"
                                                                valign="top">
                                                                <table align="center" border="0" cellpadding="0"
                                                                    cellspacing="0" class="divider_content" height="0"
                                                                    role="presentation"
                                                                    style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-top: 0px solid transparent; height: 0px; width: 100%;"
                                                                    valign="top" width="100%">
                                                                    <tbody>
                                                                        <tr style="vertical-align: top;" valign="top">
                                                                            <td height="0"
                                                                                style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"
                                                                                valign="top"><span></span></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <!--[if (!mso)&(!IE)]><!-->
                                            </div>
                                            <!--<![endif]-->
                                        </div>
                                    </div>
                                    <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                                    <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
                                </div>
                            </div>
                        </div>
                        <div style="background-color:#c4d6ec;">
                            <div class="block-grid"
                                style="min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; Margin: 0 auto; background-color: transparent;">
                                <div
                                    style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;">
                                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#c4d6ec;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px"><tr class="layout-full-width" style="background-color:transparent"><![endif]-->
                                    <!--[if (mso)|(IE)]><td align="center" width="650" style="background-color:transparent;width:650px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:20px; padding-bottom:20px;"><![endif]-->
                                    <div class="col num12"
                                        style="min-width: 320px; max-width: 650px; display: table-cell; vertical-align: top; width: 650px;">
                                        <div class="col_cont" style="width:100% !important;">
                                            <!--[if (!mso)&(!IE)]><!-->
                                            <div
                                                style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:20px; padding-bottom:20px; padding-right: 0px; padding-left: 0px;">
                                                <!--<![endif]-->
                                                <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 10px; padding-left: 10px; padding-top: 10px; padding-bottom: 10px; font-family: Arial, sans-serif"><![endif]-->
                                                <div
                                                    style="color:#3f4d75;font-family:Roboto Slab, Arial, Helvetica Neue, Helvetica, sans-serif;line-height:1.2;padding-top:10px;padding-right:10px;padding-bottom:10px;padding-left:10px;">
                                                    <div class="txtTinyMce-wrapper"
                                                        style="font-size: 14px; line-height: 1.2; color: #3f4d75; font-family: Roboto Slab, Arial, Helvetica Neue, Helvetica, sans-serif; mso-line-height-alt: 17px;">
                                                        <p
                                                            style="margin: 0; font-size: 12px; line-height: 1.2; word-break: break-word; text-align: center; mso-line-height-alt: 14px; margin-top: 0; margin-bottom: 0;">
                                                            <span style="font-size: 12px;">If you have any further questions, please feel free to</span><br /><span
                                                                style="font-size: 12px;"> contact us
                                                                at <a href="mailto:example@example.com" rel="noopener"
                                                                    style="text-decoration: underline; color: #ffffff;"
                                                                    target="_blank"
                                                                    title="support@mysellum.com">support@mysellum.com</a>.</span></p>
                                                    </div>
                                                </div>
                                                <!--[if mso]></td></tr></table><![endif]-->
                                                <!--[if (!mso)&(!IE)]><!-->
                                            </div>
                                            <!--<![endif]-->
                                        </div>
                                    </div>
                                    <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                                    <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
                                </div>
                            </div>
                        </div>
                        <div style="background-color:#f3f6fe;">
                            <div class="block-grid"
                                style="min-width: 320px; max-width: 650px; overflow-wrap: break-word; word-wrap: break-word; word-break: break-word; Margin: 0 auto; background-color: transparent;">
                                <div
                                    style="border-collapse: collapse;display: table;width: 100%;background-color:transparent;">
                                    <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f3f6fe;"><tr><td align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px"><tr class="layout-full-width" style="background-color:transparent"><![endif]-->
                                    <!--[if (mso)|(IE)]><td align="center" width="650" style="background-color:transparent;width:650px; border-top: 0px solid transparent; border-left: 0px solid transparent; border-bottom: 0px solid transparent; border-right: 0px solid transparent;" valign="top"><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 0px; padding-left: 0px; padding-top:0px; padding-bottom:0px;"><![endif]-->
                                    <div class="col num12"
                                        style="min-width: 320px; max-width: 650px; display: table-cell; vertical-align: top; width: 650px;">
                                        <div class="col_cont" style="width:100% !important;">
                                            <!--[if (!mso)&(!IE)]><!-->
                                            <div
                                                style="border-top:0px solid transparent; border-left:0px solid transparent; border-bottom:0px solid transparent; border-right:0px solid transparent; padding-top:0px; padding-bottom:0px; padding-right: 0px; padding-left: 0px;">
                                                <!--<![endif]-->
                                                <table border="0" cellpadding="0" cellspacing="0" class="divider"
                                                    role="presentation"
                                                    style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"
                                                    valign="top" width="100%">
                                                    <tbody>
                                                        <tr style="vertical-align: top;" valign="top">
                                                            <td class="divider_inner"
                                                                style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 15px; padding-right: 15px; padding-bottom: 15px; padding-left: 15px;"
                                                                valign="top">
                                                                <table align="center" border="0" cellpadding="0"
                                                                    cellspacing="0" class="divider_content" height="10"
                                                                    role="presentation"
                                                                    style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-top: 0px solid transparent; height: 10px; width: 100%;"
                                                                    valign="top" width="100%">
                                                                    <tbody>
                                                                        <tr style="vertical-align: top;" valign="top">
                                                                            <td height="10"
                                                                                style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"
                                                                                valign="top"><span></span></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <table cellpadding="0" cellspacing="0" class="social_icons"
                                                    role="presentation"
                                                    style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt;"
                                                    valign="top" width="100%">
                                                    <tbody>
                                                        <tr style="vertical-align: top;" valign="top">
                                                            <td style="word-break: break-word; vertical-align: top; padding-top: 10px; padding-right: 20px; padding-bottom: 10px; padding-left: 20px;"
                                                                valign="top">
                                                                <table align="center" cellpadding="0" cellspacing="0"
                                                                    class="social_table" role="presentation"
                                                                    style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-tspace: 0; mso-table-rspace: 0; mso-table-bspace: 0; mso-table-lspace: 0;"
                                                                    valign="top">
                                                                    <tbody>
                                                                        <tr align="center"
                                                                            style="vertical-align: top; display: inline-block; text-align: center;"
                                                                            valign="top">
                                                                            <td style="word-break: break-word; vertical-align: top; padding-bottom: 0; padding-right: 10px; padding-left: 10px;"
                                                                                valign="top"><a
                                                                                    href="https://www.facebook.com/"
                                                                                    target="_blank"><img alt="Facebook"
                                                                                        height="32"
                                                                                        src="cid:facebook_logo"
                                                                                        style="text-decoration: none; -ms-interpolation-mode: bicubic; height: auto; border: 0; display: block;"
                                                                                        title="facebook" width="32" /></a>
                                                                            </td>
                                                                            <td style="word-break: break-word; vertical-align: top; padding-bottom: 0; padding-right: 10px; padding-left: 10px;"
                                                                                valign="top"><a
                                                                                    href="https://www.twitter.com/"
                                                                                    target="_blank"><img alt="Twitter"
                                                                                        height="32"
                                                                                        src="cid:twitter_logo"
                                                                                        style="text-decoration: none; -ms-interpolation-mode: bicubic; height: auto; border: 0; display: block;"
                                                                                        title="twitter" width="32" /></a>
                                                                            </td>
                                                                            <td style="word-break: break-word; vertical-align: top; padding-bottom: 0; padding-right: 10px; padding-left: 10px;"
                                                                                valign="top"><a
                                                                                    href="https://www.linkedin.com/"
                                                                                    target="_blank"><img alt="Linkedin"
                                                                                        height="32"
                                                                                        src="cid:linkedin_logo"
                                                                                        style="text-decoration: none; -ms-interpolation-mode: bicubic; height: auto; border: 0; display: block;"
                                                                                        title="linkedin" width="32" /></a>
                                                                            </td>
                                                                            <td style="word-break: break-word; vertical-align: top; padding-bottom: 0; padding-right: 10px; padding-left: 10px;"
                                                                                valign="top"><a
                                                                                    href="https://www.instagram.com/"
                                                                                    target="_blank"><img alt="Instagram"
                                                                                        height="32"
                                                                                        src="cid:instagram_logo"
                                                                                        style="text-decoration: none; -ms-interpolation-mode: bicubic; height: auto; border: 0; display: block;"
                                                                                        title="instagram" width="32" /></a>
                                                                            </td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding-right: 20px; padding-left: 20px; padding-top: 10px; padding-bottom: 10px; font-family: Arial, sans-serif"><![endif]-->
                                                <div
                                                    style="color:#7999ac;font-family:Roboto Slab, Arial, Helvetica Neue, Helvetica, sans-serif;line-height:1.2;padding-top:10px;padding-right:20px;padding-bottom:10px;padding-left:20px;">
                                                    <div class="txtTinyMce-wrapper"
                                                        style="line-height: 1.2; font-size: 12px; color: #7999ac; font-family: Roboto Slab, Arial, Helvetica Neue, Helvetica, sans-serif; mso-line-height-alt: 14px;">
                                                        <p
                                                            style="margin: 0; font-size: 12px; line-height: 1.2; word-break: break-word; text-align: center; mso-line-height-alt: 14px; margin-top: 0; margin-bottom: 0;">
                                                            <span style="font-size: 12px;">Sed posuere consectetur est at
                                                                lobortis. Aenean eu leo quam. Pellentesque ornare sem
                                                                lacinia quam venenatis vestibulum. Cras mattis consectetur
                                                                purus sit amet fermentum. Vestibulum id ligula porta felis
                                                                euismod semper. Curabitur blandit tempus porttitor. Morbi
                                                                leo risus, porta ac consectetur ac, vestibulum at
                                                                eros.</span></p>
                                                    </div>
                                                </div>
                                                <!--[if mso]></td></tr></table><![endif]-->
                                                <div align="center" class="img-container center fixedwidth"
                                                    style="padding-right: 20px;padding-left: 20px;">
                                                    <!--[if mso]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr style="line-height:0px"><td style="padding-right: 20px;padding-left: 20px;" align="center"><![endif]-->
                                                    <div style="font-size:1px;line-height:10px"> </div><img align="center"
                                                        alt="Mysellum Logo" border="0" class="center fixedwidth"
                                                        src="cid:mysellum_logo"
                                                        style="text-decoration: none; -ms-interpolation-mode: bicubic; height: auto; border: 0; width: 100%; max-width: 130px; display: block;"
                                                        title="Mysellum Logo" width="130" />
                                                    <div style="font-size:1px;line-height:10px"> </div>
                                                    <!--[if mso]></td></tr></table><![endif]-->
                                                </div>
                                                <table border="0" cellpadding="0" cellspacing="0" class="divider"
                                                    role="presentation"
                                                    style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"
                                                    valign="top" width="100%">
                                                    <tbody>
                                                        <tr style="vertical-align: top;" valign="top">
                                                            <td class="divider_inner"
                                                                style="word-break: break-word; vertical-align: top; min-width: 100%; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%; padding-top: 10px; padding-right: 10px; padding-bottom: 10px; padding-left: 10px;"
                                                                valign="top">
                                                                <table align="center" border="0" cellpadding="0"
                                                                    cellspacing="0" class="divider_content" height="10"
                                                                    role="presentation"
                                                                    style="table-layout: fixed; vertical-align: top; border-spacing: 0; border-collapse: collapse; mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-top: 0px solid transparent; height: 10px; width: 100%;"
                                                                    valign="top" width="100%">
                                                                    <tbody>
                                                                        <tr style="vertical-align: top;" valign="top">
                                                                            <td height="10"
                                                                                style="word-break: break-word; vertical-align: top; -ms-text-size-adjust: 100%; -webkit-text-size-adjust: 100%;"
                                                                                valign="top"><span></span></td>
                                                                        </tr>
                                                                    </tbody>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                                <!--[if (!mso)&(!IE)]><!-->
                                            </div>
                                            <!--<![endif]-->
                                        </div>
                                    </div>
                                    <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                                    <!--[if (mso)|(IE)]></td></tr></table></td></tr></table><![endif]-->
                                </div>
                            </div>
                        </div>
                        <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                    </td>
                </tr>
            </tbody>
        </table>
        <!--[if (IE)]></div><![endif]-->
    </body>

    </html>

    `;
    return htmlBody;
}
