import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import HomeScreen from './src/screens/HomeScreen';
import ModuleAScreen from './src/screens/ModuleAScreen';
import ModuleBScreen from './src/screens/ModuleBScreen';
import ModuleCScreen from './src/screens/ModuleCScreen';
import ResultScreen from './src/screens/ResultScreen';

import type { BasicInfo, ScreeningAnswers, ConsentData } from './src/types/donor';
import { calculateEligibility } from './src/lib/eligibility';

export type RootStackParamList = {
  Home: undefined;
  Register: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

function RegisterFlow({ navigation }: { navigation: any }) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [basicInfo, setBasicInfo] = useState<BasicInfo | null>(null);
  const [screening, setScreening] = useState<ScreeningAnswers | null>(null);
  const [donorId, setDonorId] = useState('');

  async function submitToServer(info: BasicInfo, ans: ScreeningAnswers, consent: ConsentData) {
    const eligibility = calculateEligibility(info, ans);
    try {
      const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'}/api/donors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...info,
          screeningAnswers: ans,
          consentGiven: consent.consentGiven,
          wantTestResults: consent.wantTestResults,
          consentTimestamp: consent.timestamp,
          eligibilityStatus: eligibility.status,
          deferralReason: eligibility.reason,
          eligibleReturnDate: eligibility.eligibleReturnDate,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        return { id: data.id as string, eligibility };
      }
    } catch {
      // offline fallback
    }
    return { id: `LOCAL-${Date.now()}`, eligibility };
  }

  if (step === 1 || basicInfo === null) {
    return (
      <ModuleAScreen
        onNext={info => {
          setBasicInfo(info);
          setStep(2);
        }}
      />
    );
  }

  if (step === 2 || screening === null) {
    return (
      <ModuleBScreen
        gender={basicInfo.gender}
        onBack={() => setStep(1)}
        onNext={ans => {
          setScreening(ans);
          setStep(3);
        }}
      />
    );
  }

  if (step === 3) {
    return (
      <ModuleCScreen
        registeredName={basicInfo.fullName}
        onBack={() => setStep(2)}
        onNext={async consent => {
          const { id, eligibility } = await submitToServer(basicInfo, screening, consent);
          setDonorId(id);
          setStep(4);
        }}
      />
    );
  }

  return (
    <ResultScreen
      result={calculateEligibility(basicInfo, screening)}
      basicInfo={basicInfo}
      donorId={donorId}
      onDone={() => navigation.navigate('Home')}
    />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Register" component={RegisterFlow} />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
