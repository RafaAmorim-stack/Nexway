import React from 'react';
import { Text, View } from 'react-native';
import type { Session } from '../navigation/session';
import type { MarkerId } from '../data/catalog';
export default function ARView(_: { session: Session; onMarker: (id: MarkerId) => void }) {
 return <View style={{padding:20,backgroundColor:'#ffffff',borderRadius:4,borderWidth:1,borderColor:'#d5dbd9'}}><Text style={{color:'#637078',fontSize:13,lineHeight:20}}>A câmera AR está disponível no aplicativo nativo Android. Volte à busca e selecione o modo demonstração para testar pelo navegador.</Text></View>;
}
