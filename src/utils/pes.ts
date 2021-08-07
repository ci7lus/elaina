/**
 * https://twitter.com/magicxqq/status/1381813912539066373
 * https://github.com/l3tnun/EPGStation/blob/ceaa8641e6c78ffd0e613c606c69351ff682b9c5/client/src/components/video/LiveMpegTsVideo.vue#L132-L145
 */

export const parseMalformedPES = (data: Uint8Array) => {
  /*const pes_scrambling_control = (data[0] & 0x30) >>> 4
  const pts_dts_flags = (data[1] & 0xc0) >>> 6*/
  const pes_header_data_length = data[2]
  const payload_start_index = 3 + pes_header_data_length
  const payload_length = data.byteLength - payload_start_index
  const payload = data.subarray(
    payload_start_index,
    payload_start_index + payload_length
  )
  return payload
}
