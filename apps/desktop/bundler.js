// based on https://gist.github.com/robin-hartmann/ad6ffc19091c9e661542fbf178647047
"use strict";

import fs from "fs/promises";
import path from "path";

import arborist from "@npmcli/arborist";
import { findRoot } from "@manypkg/find-root";

const resolveLink = (node) => (node.isLink ? resolveLink(node.target) : node);

const getWorkspaceByPath = (node, realPath) => {
  return [...node.edgesOut.values()]
    .filter((depEdge) => depEdge.workspace)
    .map((depEdge) => resolveLink(depEdge.to))
    .find((depNode) => depNode.realpath === realPath);
};

const collectProdDeps = (node) => {
  const stack = [node];
  const result = new Map();

  while (stack.length > 0) {
    const currentNode = stack.pop();
    // Ignore types packages
    if (currentNode.location.startsWith("node_modules/@types")) {
      continue;
    }

    // Ignore radix-ui packages
    if (currentNode.location.includes("@radix-ui")) {
      continue;
    }

    const depEdges = [...currentNode.edgesOut.values()]
      .filter((depEdge) => depEdge.type === "prod")
      .filter(
        (depEdge) => !depEdge.to.location.startsWith("node_modules/@types")
      );

    for (const depEdge of depEdges) {
      const depNode = resolveLink(depEdge.to);

      const addedNode = result.get(depNode.name);
      if (addedNode) {
        const addedVersion = Number(addedNode.version.replace(/[.]/g, ""));
        const depVersion = Number(depNode.version.replace(/[.]/g, ""));

        if (depVersion > addedVersion) {
          stack.push(depNode);
        }
      } else {
        stack.push(depNode);
      }

      result.set(depNode.name, depNode);
    }
  }

  return Array.from(result.values());
};

export const bundle = async (source, destination) => {
  const root = await findRoot(source);
  const rootNode = await new arborist({ path: root.rootDir }).loadActual();
  const sourceNode = getWorkspaceByPath(rootNode, source);

  if (!sourceNode) {
    throw new Error("couldn't find source node");
  }

  const prodDeps = collectProdDeps(sourceNode);

  for (const dep of prodDeps) {
    const dest = dep.location.startsWith("packages")
      ? path.join(destination, "node_modules", "@microflow", dep.name)
      : path.join(destination, "node_modules", dep.name);

    if (dep.name.startsWith("@types")) {
      continue;
    }

    await fs.cp(dep.realpath, dest, {
      recursive: true,
      errorOnExist: false,
      dereference: true,
    });
  }
};
