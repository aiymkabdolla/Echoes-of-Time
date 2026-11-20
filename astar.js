class AStar {

    constructor(graph) {
        this.graph = graph;
    }


    heuristic(a, b) {

        const positions = {

            station: [0, 0],
            asteroid: [2, 1],
            nebula: [4, 3],
            planet: [4, 1],
            gate: [6, 2],
            signal: [8, 4]

        };

        const posA = positions[a];
        const posB = positions[b];

        if (!posA || !posB) {
            return 0;
        }

        return Math.abs(posA[0] - posB[0]) +
               Math.abs(posA[1] - posB[1]);
    }


    findPath(start, goal) {

        if (start === goal) {
            return [start];
        }

        const openSet = [start];

        const cameFrom = {};

        const gScore = {};
        const fScore = {};

        Object.keys(this.graph).forEach(node => {

            gScore[node] = Infinity;
            fScore[node] = Infinity;

        });

        gScore[start] = 0;

        fScore[start] =
            this.heuristic(start, goal);


        while (openSet.length > 0) {

            let current = openSet[0];

            for (const node of openSet) {

                if (fScore[node] < fScore[current]) {
                    current = node;
                }

            }


            if (current === goal) {

                return this.reconstructPath(
                    cameFrom,
                    current
                );

            }


            const index =
                openSet.indexOf(current);

            openSet.splice(index, 1);


            const neighbors =
                this.graph[current] || [];


            for (const neighbor of neighbors) {

                const tentativeG =
                    gScore[current] + 1;


                if (tentativeG < gScore[neighbor]) {

                    cameFrom[neighbor] = current;

                    gScore[neighbor] =
                        tentativeG;

                    fScore[neighbor] =
                        tentativeG +
                        this.heuristic(
                            neighbor,
                            goal
                        );


                    if (!openSet.includes(neighbor)) {
                        openSet.push(neighbor);
                    }

                }

            }

        }


        return null;
    }


    reconstructPath(cameFrom, current) {

        const path = [current];

        while (cameFrom[current]) {

            current = cameFrom[current];

            path.unshift(current);

        }

        return path;
    }

}