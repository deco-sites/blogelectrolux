import { Route } from "apps/website/flags/audience.ts";

const decoSiteMapUrl = "/sitemap/deco.xml";

const buildProxyRoutes = (
  {
    urlToProxy,
    pathsToProxy,
  }: {
    pathsToProxy: string[];
    urlToProxy: string;
  },
) => {
  const publicUrl = new URL(urlToProxy);

  try {
    const hostname = publicUrl.hostname;

    if (!hostname || hostname.split(".").length <= 2) {
      throw new Error(`Invalid hostname from '${publicUrl}'`);
    }

    // TODO @lucis: Fix the proxy, MITM

    const urlToProxy = `https://${hostname}`;
    const hostToUse = hostname;

    const routeFromPath = (pathTemplate: string): Route => ({
      pathTemplate,
      handler: {
        value: {
          __resolveType: "website/handlers/proxy.ts",
          url: urlToProxy,
          host: hostToUse,
        },
      },
    });
    const routesFromPaths = [...pathsToProxy]?.map(
      routeFromPath,
    );

    const [_include, routes] = [[decoSiteMapUrl], [{
      pathTemplate: decoSiteMapUrl,
      handler: {
        value: {
          __resolveType: "website/handlers/sitemap.ts",
        },
      },
    }]];

    return [
      ...routes,
      ...routesFromPaths,
    ];
  } catch (e) {
    console.log("Error parsing publicUrl");
    console.error(e);
    return [];
  }
};

export interface Props {
  urlToProxy: string;
  pathsToProxy?: string[];
  /**
   * @title If deco site map should be exposed at /deco-sitemap.xml
   */
  generateDecoSiteMap?: boolean;
}

/**
 * @title Proxy Routes
 */
function loader(
  {
    pathsToProxy = [],
    urlToProxy,
  }: Props,
): Route[] {
  return buildProxyRoutes({
    pathsToProxy,
    urlToProxy,
  });
}

export default loader;
