import React from 'react';
import { Text, View } from 'react-native';
import type { Session } from '../navigation/session';
import type { MarkerId } from '../data/catalog';
export default function ARView(_: { session: Session; onMarker: (id: MarkerId) => void }) {
 return <View style={{padding:24,backgroundColor:'#17283c',borderRadius:12}}><Text style={{color:'#fff'}}>A câmera AR está disponível no aplicativo nativo Android. Volte à busca e selecione o modo demonstração para testar pelo navegador.</Text></View>;
}
