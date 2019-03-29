import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Domain } from '../../models/domain';
import * as rp from 'request-promise';
import * as cheerio from 'cheerio';

@Injectable()
export class DomainService {
    private whoIsLink = 'https://www.cctld.kg/cgi-bin/whois.cgi';
    private netKgUrl = 'https://www.net.kg/';
    private size = 1500;

    constructor(@InjectModel('Domain') private readonly domainModel: Model<Domain>) {
    }

    async parseNetKg() {
        const options = {
            method: 'POST',
            uri: this.netKgUrl,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            form: {
                pp: this.size,
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

    async getDomainsFromNetKg() {
        const domains = await this.parseNetKg();
        for (const domain of domains) {
            const domainWithInfo = await this.extractDataFromWhoIs(domain);
            const domainFromDB = await this.findOne(domainWithInfo);
            if (domainFromDB == null) {
                await this.create(domainWithInfo);
                console.log(domainWithInfo);
            }
        }
        return domains;
    }

    async create(createDomain: Domain): Promise<Domain> {
        const createdCat = new this.domainModel(createDomain);
        return await createdCat.save();
    }

    async findAll(): Promise<Domain[]> {
        return await this.domainModel.find().exec();
    }

    async findOne(domain: Domain): Promise<Domain[]> {
        return await this.domainModel.findOne({ link: domain.link });
    }
}
