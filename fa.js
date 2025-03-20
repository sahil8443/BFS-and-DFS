let graph = {};
let vertices = [];
let edges = [];
let traversalType = "";
let visited = [];
let resultSequence = [];
const canvas = document.getElementById("graphCanvas");
const ctx = canvas.getContext("2d");
let scale = 1;
let offsetX = 0, offsetY = 0;

// Create graph based on inputs
function createGraph() {
    vertices = document.getElementById("verticesInput").value.split(",").map(v => v.trim());
    edges = document.getElementById("edgesInput").value.split(",").map(e => e.trim());
    graph = {};

    vertices.forEach(v => graph[v] = []);
    edges.forEach(edge => {
        const [from, to] = edge.split("-").map(v => v.trim());
        graph[from].push(to);
    });

    drawGraph();
}

// Draw graph on the canvas with zoom and pan
function drawGraph() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const positions = {};
    const radius = 150 * scale;
    const angleStep = (2 * Math.PI) / vertices.length;

    vertices.forEach((vertex, index) => {
        const angle = index * angleStep;
        const x = canvas.width / 2 + Math.cos(angle) * radius + offsetX;
        const y = canvas.height / 2 + Math.sin(angle) * radius + offsetY;
        positions[vertex] = { x, y };
    });

    edges.forEach(edge => {
        const [from, to] = edge.split("-");
        const { x: x1, y: y1 } = positions[from];
        const { x: x2, y: y2 } = positions[to];
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = visited.includes(from) && visited.includes(to) ? "#ff6347" : "black";  // Highlight visited edges
        ctx.stroke();
    });

    vertices.forEach(vertex => {
        const { x, y } = positions[vertex];
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fillStyle = visited.includes(vertex) ? "#9e9e9e" : "#ffffff";
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "black";
        ctx.fillText(vertex, x - 5, y + 5);
    });
}

// BFS Traversal
async function bfs(start) {
    const queue = [start]; // Initialize the queue with the start node
    visited = [];          // Reset the visited nodes
    resultSequence = [];   // Reset the result sequence
    const stepsContainer = document.getElementById("steps");
    stepsContainer.innerHTML = ""; // Clear previous steps

    while (queue.length) {
        const node = queue.shift(); // Dequeue the front node

        if (!visited.includes(node)) {
            visited.push(node);         // Mark the node as visited
            resultSequence.push(node);  // Add it to the result sequence

            // Add neighbors to the queue
            graph[node].forEach(neighbor => {
                if (!visited.includes(neighbor)) {
                    queue.push(neighbor);
                }
            });

            // Update visualization
            drawGraph();
            await new Promise(resolve => setTimeout(resolve, 1000));
            addStep("Queue", [...queue]); // Show the current state of the queue
            updateResultSequence();
        }
    }
}

// Recursive DFS Traversal
async function dfsRecursive(node) {
    // Base case: Stop if the node is already visited
    if (visited.includes(node)) return;

    // Mark the current node as visited
    visited.push(node);
    resultSequence.push(node);

    // Update visualization
    drawGraph();
    await new Promise(resolve => setTimeout(resolve, 1000));
    addStep("Stack (Recursively Traversed)", [node]);
    updateResultSequence();

    // Visit all unvisited neighbors recursively
    if (graph[node]) {
        for (const neighbor of graph[node]) {
            if (!visited.includes(neighbor)) {
                await dfsRecursive(neighbor);
            }
        }
    }
}

// DFS Traversal
async function dfs(start) {
    visited = [];
    resultSequence = [];
    const stepsContainer = document.getElementById("steps");
    stepsContainer.innerHTML = ""; // Clear previous steps

    await dfsRecursive(start);
}

// Add traversal step to the UI
function addStep(type, data) {
    const stepsContainer = document.getElementById("steps");
    const step = document.createElement("div");
    step.className = "step";
    step.innerHTML = `<strong>${type}:</strong> ${data.join(", ")}`;
    stepsContainer.appendChild(step);
}

// Update result sequence in the UI
function updateResultSequence() {
    document.getElementById("resultSequence").textContent = `Traversal Sequence: ${resultSequence.join(", ")}`;
}

// Start traversal when button is clicked
function startTraversal() {
    createGraph();
    traversalType = document.querySelector('input[name="traversalType"]:checked')?.value;
    const startVertex = document.getElementById("startVertex").value.trim() || vertices[0];

    if (!graph[startVertex]) {
        alert("Invalid start vertex!");
        return;
    }

    if (traversalType === "BFS") {
        bfs(startVertex);
    } else if (traversalType === "DFS") {
        dfs(startVertex);
    }
}

// Clear the graph and inputs
function clearGraph() {
    document.getElementById("verticesInput").value = "";
    document.getElementById("edgesInput").value = "";
    document.getElementById("startVertex").value = "";
    document.getElementById("steps").innerHTML = "";
    document.getElementById("resultSequence").textContent = "";
    visited = [];
    resultSequence = [];
    drawGraph();
}
