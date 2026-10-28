import { DisplayedDashboard } from "@/components/cards/CommunityCard";
import { useEffect, useRef, useState } from "react";

// Served from apps/frontend/public/graph
const PERSON_ICON_URL = "/graph/icon-person.obj";

const REFRESH_TIME = 60 * 1000; // 60 seconds
const REFRESH_CHECK_INTERVAL = 5000; // 5 seconds

type Edge = {
  tapSenderId: string;
  tapReceiverId: string;
  updatedAt: string;
};

type WanderedElement = HTMLElement & {
  graphData?: { links: unknown[] };
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      "webscape-wanderer": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & { [attr: string]: unknown };
    }
  }
}

function fakeUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function fetchMockEdgeList(numNodes = 100, numEdges = 200): Edge[] {
  const nodeIds = Array.from({ length: numNodes }, () => fakeUUID());
  const edgeList: Edge[] = [];

  for (let i = 0; i < numEdges; i++) {
    const fromIndex = Math.floor(Math.random() * numNodes);
    let toIndex;
    do {
      toIndex = Math.floor(Math.random() * numNodes);
    } while (toIndex === fromIndex);

    edgeList.push({
      tapSenderId: nodeIds[fromIndex],
      tapReceiverId: nodeIds[toIndex],
      updatedAt: new Date(Date.now() - i * 60000).toISOString(),
    });
  }

  return edgeList;
}

// TODO: replace with real social graph edges once the backend exposes them
async function fetchEdgeList(): Promise<Edge[]> {
  return fetchMockEdgeList();
}

export default function GlobalPage({}: {
  displayedDashboard: DisplayedDashboard;
  setDisplayedDashboard: (dashboard: DisplayedDashboard) => void;
}) {
  const wandererRef = useRef<WanderedElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const [graphTop, setGraphTop] = useState(0);

  // Keep the graph pinned just below the nav bar, whose height can change on resize
  useEffect(() => {
    const updateGraphTop = () => {
      if (anchorRef.current) {
        setGraphTop(anchorRef.current.getBoundingClientRect().top);
      }
    };

    updateGraphTop();
    window.addEventListener("resize", updateGraphTop);
    return () => window.removeEventListener("resize", updateGraphTop);
  }, []);

  useEffect(() => {
    let cancelled = false;
    let lastTouchTime = Date.now();
    let interval: ReturnType<typeof setInterval> | undefined;

    const onTouchStart = () => {
      lastTouchTime = Date.now();
    };

    const loadWebscapeWanderer = async () => {
      // webscape-wanderer touches browser globals, so it can only be imported client-side
      const { startWebscapeWanderer, dataFromGraph } =
        await import("webscape-wanderer");
      if (cancelled) return;

      const prepareGraphData = (edgeList: Edge[]) => {
        const seenNodeIds = new Set<string>();
        const nodes: { id: string }[] = [];
        const links: { source: string; target: string; timestamp: string }[] =
          [];

        for (const {
          tapSenderId: source,
          tapReceiverId: target,
          updatedAt: timestamp,
        } of edgeList) {
          if (!seenNodeIds.has(source)) {
            seenNodeIds.add(source);
            nodes.push({ id: source });
          }
          if (!seenNodeIds.has(target)) {
            seenNodeIds.add(target);
            nodes.push({ id: target });
          }
          links.push({ source, target, timestamp });
        }

        return dataFromGraph({ nodes, links });
      };

      const updateGraphIfChanged = async () => {
        const edgeList = await fetchEdgeList();
        const w = wandererRef.current;
        if (!w || cancelled) return;
        if (edgeList.length === w.graphData?.links.length) {
          console.log("no need to prepare more graph data");
        } else {
          w.graphData = prepareGraphData(edgeList);
        }
      };

      startWebscapeWanderer();
      wandererRef.current?.setAttribute("node-shape", PERSON_ICON_URL);
      updateGraphIfChanged();

      document.addEventListener("touchstart", onTouchStart);
      interval = setInterval(() => {
        if (Date.now() - lastTouchTime > REFRESH_TIME) {
          updateGraphIfChanged();
        }
      }, REFRESH_CHECK_INTERVAL);
    };

    loadWebscapeWanderer();

    return () => {
      cancelled = true;
      clearInterval(interval);
      document.removeEventListener("touchstart", onTouchStart);
    };
  }, []);

  return (
    <>
      {/* Marks where the community nav bar ends */}
      <div ref={anchorRef} />
      {/* Fill the full width and remaining height of the screen below the nav bar */}
      <div
        className="fixed left-0 right-0 bottom-0 overflow-hidden"
        style={{
          top: graphTop,
          backgroundColor: "hsl(244 61% 15% / 1)",
          touchAction: "none",
        }}
      >
        <webscape-wanderer
          ref={wandererRef}
          style={
            {
              "--selected-color": "cyan",
              display: "block",
              width: "100%",
              height: "100%",
              touchAction: "none",
            } as React.CSSProperties
          }
          edge-scale="1"
          edge-scale-emphasized="0.5"
          node-scale="0.7"
          edge-alpha-non-emphasized="0.05"
          edge-wave-intensity="0.1"
          edge-alpha-emphasized="0.1"
          edge-wave-intensity-emphasized="10"
          edge-pulse-intensity="2"
          edge-wave-speed="5"
          edge-wave-speed-emphasized="5"
          edge-frequency="1"
          edge-frequency-emphasized="1"
        />
      </div>
    </>
  );
}
