import { START_TARGET, type MarkerId } from '../navigation/warehouseLayout';
// Larguras NOMINAIS: medir a largura externa do recorte físico antes da validação.
// A escala do mapa (1 m/célula) independe deste parâmetro do detector.
export const targetPhysicalWidths: Record<MarkerId, number> = {
  [START_TARGET]: 0.2, SF01001A: 0.2, SF01014A: 0.2, SF01009B: 0.2, SF01012B: 0.2,
};
export const targetSources: Record<MarkerId, number> = {
  [START_TARGET]: require('../../assets/markers/huawei/start-huawei.png'),
  SF01001A: require('../../assets/markers/huawei/SF01001A.png'),
  SF01014A: require('../../assets/markers/huawei/SF01014A.png'),
  SF01009B: require('../../assets/markers/huawei/SF01009B.png'),
  SF01012B: require('../../assets/markers/huawei/SF01012B.png'),
};
