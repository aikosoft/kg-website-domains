import { Injectable } from '@nestjs/common';
import * as cheerio from 'cheerio';
import * as rp from 'request-promise';
import * as fs from 'fs';

const netkgUrl = 'https://www.net.kg/';

@Injectable()
export class AppService {
    async parseNetKg() {
        const options = {
            method: 'POST',
            uri: netkgUrl,
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
        const websites = [];
        cheerio('tr[id]', hitWebPage.body).each((index, kb) => {
            const rank = cheerio('td', kb).first().text();
            const link = cheerio('a[title]', kb)[0].attribs.title;
            console.log(rank);
            console.log(link);

        });
        // const buffer = Buffer.from(hitWebPage, 'utf8');
        // fs.writeFileSync('./hitkg.html', buffer);
        return Promise.resolve('Hello World!233');
    }
}
