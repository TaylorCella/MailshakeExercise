export interface PeopleModel {
    name: string;
    world: string;
    year: string;
    films: string[];
}

export interface ServerResponse {
    count: number;
    next: string;
    previous?: string;
    results: [{}];
}

export interface Film {
    id: number;
    title: string;
}

export interface Planet {
    id: string;
    planet: string;
}
