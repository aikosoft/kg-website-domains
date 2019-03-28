import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import * as rp from 'request-promise';
import { Domain } from './models/domain';

@Injectable()
export class AppService {
    private whoIsLink = 'https://www.cctld.kg/cgi-bin/whois.cgi';
    private netkgUrl = 'https://www.net.kg/';

    async parseNetKg() {
        const options = {
            method: 'POST',
            uri: this.netkgUrl,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            form: {
                pp: 20,
                Submit: 'ok',
            },
            resolveWithFullResponse: true,
        };
        const hitWebPage = await rp(options);
        const domains: Domain[] = [];
        cheerio('tr[id]', hitWebPage.body).each((index, kb) => {
            const rank = cheerio('td', kb).first().text();
            const link = cheerio('a[title]', kb)[0].attribs.title;
            domains.push(new Domain(rank, link));
        });
        return Promise.resolve(domains);
    }

    async extractDataFromWhoIs(domain: Domain) {
        const regex = new RegExp('^(?:https?:\\/\\/)?(?:[^@\\/\\n]+@)?(?:www\\.)?([^:\\/?\\n]+)');
        let link = regex.exec(domain.link)[1];
        link = link.toUpperCase();
        const options = {
            method: 'POST',
            uri: this.whoIsLink,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Host': 'www.cctld.kg',
                'Origin': 'https://www.cctld.kg',
                'Referer': 'https://www.cctld.kg/whois.html',
            },
            form: {
                whois: link,
                next: '',
            },
            resolveWithFullResponse: true,
        };
        try {
            const whoIsPage = await rp(options);
            cheerio('pre', whoIsPage.body).each((index, pre) => {
                for (let i = 0; i < pre.children.length; i++) {
                    const child = pre.children[i];
                    const data = child.data;
                    if (!data) {
                        continue;
                    }
                    if (data.indexOf('Domain') > -1) {
                        domain.info.company = data.trim();
                    } else if (data.indexOf('Record created: ') > -1) {
                        domain.info.createdDate = data.substr('Record created: '.length).trim();
                    } else if (data.indexOf('Record last updated on') > -1) {
                        domain.info.updatedDate = data.substr('Record last updated on'.length).trim();
                    } else if (data.indexOf('Record expires on') > -1) {
                        domain.info.expireDate = data.substr('Record expires on'.length).trim();
                    }
                }
            });
        } catch (e) {
            console.log(e);
        }
        return domain;
    }

    async extractDomainsFromNetKg() {
        const domains = await this.parseNetKg();
        for (const domain of domains) {
            await this.extractDataFromWhoIs(domain);
        }
        return domains;
    }
}
