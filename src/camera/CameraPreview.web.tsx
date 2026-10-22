import React from 'react';
import { Text, View } from 'react-native';
import type { Session } from '../navigation/session';
import type { MarkerId } from '../data/catalog';
export default function CameraPreview(_: { session: Session; onMarker: (id: MarkerId) => void }) {
 return <View style={{padding:20,backgroundColor:'#ffffff',borderRadius:4,borderWidth:1,borderColor:'#d5dbd9'}}><Text style={{color:'#637078',fontSize:13,lineHeight:20}}>Para usar a câmera, abra o Nexway no Expo Go do iPhone ou Android. No navegador, selecione Usar demonstração para testar o percurso por botões.</Text></View>;
}
