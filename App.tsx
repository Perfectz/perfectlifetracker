import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Provider as PaperProvider, MD3LightTheme, Button, Card, Title, Paragraph } from 'react-native-paper';

// Create a theme based on the shared theme in our library
// We'll directly define it here for now and later import from the shared library
const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1976d2',
    primaryContainer: '#4791db',
    secondary: '#dc004e',
    secondaryContainer: '#e33371',
    surface: '#ffffff',
    background: '#f5f5f5',
    error: '#f44336',
  },
};

export default function App() {
  const [counter, setCounter] = useState(0);

  const incrementCounter = () => {
    setCounter(counter + 1);
  };

  return (
    <PaperProvider theme={theme}>
      <View style={styles.container}>
        <StatusBar style="auto" />
        
        <Card style={styles.card}>
          <Card.Content>
            <Title>Perfect LifeTracker Pro</Title>
            <Paragraph>Mobile Edition</Paragraph>
            <Text style={styles.counter}>Count: {counter}</Text>
          </Card.Content>
          <Card.Actions>
            <Button mode="contained" onPress={incrementCounter}>
              Increment
            </Button>
          </Card.Actions>
        </Card>

        <View style={styles.buttonContainer}>
          <Button 
            mode="outlined" 
            style={styles.button}
            onPress={() => console.log('Tasks button pressed')}
          >
            Tasks
          </Button>
          <Button 
            mode="outlined" 
            style={styles.button}
            onPress={() => console.log('Fitness button pressed')}
          >
            Fitness
          </Button>
          <Button 
            mode="outlined" 
            style={styles.button}
            onPress={() => console.log('Goals button pressed')}
          >
            Goals
          </Button>
        </View>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    marginBottom: 20,
  },
  counter: {
    fontSize: 24,
    marginVertical: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
}); 