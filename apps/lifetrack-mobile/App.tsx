import React, { useState, useEffect } from 'react';
import { StyleSheet, View, FlatList, RefreshControl, Alert } from 'react-native';
import { Provider as PaperProvider, Appbar, TextInput, Button, List } from 'react-native-paper';
import * as SQLite from 'expo-sqlite';
import { format } from 'date-fns';

// Open or create local SQLite database
const db = SQLite.openDatabase('lifetrack.db');

// Initialize table on first run
const initDb = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS weight_entries (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         date TEXT NOT NULL,
         weight REAL NOT NULL
       );`,
      [],
      () => console.log('✅ weight_entries table ready'),
      (_, err) => { console.error('DB init error', err); return false; }
    );
  });
};

export default function App() {
  const [entries, setEntries] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initDb();
    loadEntries();
  }, []);

  // Load entries from DB
  const loadEntries = () => {
    setLoading(true);
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM weight_entries ORDER BY date DESC;',
        [],
        (_, { rows }) => { setEntries(rows._array); setLoading(false); },
        (_, err) => { console.error('Load error', err); setLoading(false); return false; }
      );
    });
  };

  // Add a new entry
  const addEntry = () => {
    const w = parseFloat(input);
    if (isNaN(w) || w <= 0) {
      Alert.alert('Invalid weight', 'Please enter a positive number.');
      return;
    }
    const date = new Date().toISOString();
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO weight_entries (date, weight) VALUES (?, ?);',
        [date, w],
        () => { setInput(''); loadEntries(); },
        (_, err) => { console.error('Insert error', err); return false; }
      );
    });
  };

  // Render each entry
  const renderItem = ({ item }) => (
    <List.Item
      title={`${format(new Date(item.date), 'PP')}: ${item.weight.toFixed(1)}`}
    />
  );

  return (
    <PaperProvider>
      <Appbar.Header>
        <Appbar.Content title="Weight Tracker" />
      </Appbar.Header>
      <View style={styles.container}>
        <TextInput
          label="Weight"
          keyboardType="numeric"
          value={input}
          onChangeText={setInput}
          style={styles.input}
        />
        <Button mode="contained" onPress={addEntry} style={styles.button}>
          Add Entry
        </Button>
        <FlatList
          data={entries}
          keyExtractor={item => item.id.toString()}
          renderItem={renderItem}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={loadEntries} />}
          style={styles.list}
        />
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  input: { marginBottom: 8 },
  button: { marginBottom: 16 },
  list: { flex: 1 },
});
