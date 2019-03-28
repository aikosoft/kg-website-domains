export class Domain {
    link: string;
    rank: string;
    info: {
        company?: string;
        createdDate?: string;
        updatedDate?: string;
        expireDate?: string;
    } = {};

    constructor(rank, link) {
        this.rank = rank;
        this.link = link;
    }
}
