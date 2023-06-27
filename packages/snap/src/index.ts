import { OnRpcRequestHandler } from '@metamask/snaps-types';
import { panel, text } from '@metamask/snaps-ui';

/**
 * Gets the gas fees from the beaconcha.in API.
 *
 * @returns The result of `snap_dialog`.
 */
async function getFees() {
  const response = await fetch('https://beaconcha.in/api/v1/execution/gasnow');
  return response.text();
}

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = ({ origin, request }) => {
  switch (request.method) {
    case 'getGasFees':
      return getFees().then((fees) => {
        const { data } = JSON.parse(fees);
        const feeRapid = data.rapid / 1e9;
        const feeFast = data.fast / 1e9;
        const feeStandard = data.standard / 1e9;
        const feeSlow = data.slow / 1e9;
        return snap.request({
          method: 'snap_dialog',
          params: {
            type: 'alert',
            content: panel([
              text(`Hello, **${origin}**!`),
              text(`Current gas fee estimates:`),
              text(`Rapid: ${feeRapid} Gwei`),
              text(`Fast: ${feeFast} Gwei`),
              text(`Standard: ${feeStandard} Gwei`),
              text(`Slow: ${feeSlow} Gwei`),
            ]),
          },
        });
      });
    default:
      throw new Error('Method not found.');
  }
};
