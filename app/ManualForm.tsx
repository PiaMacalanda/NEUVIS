import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, SafeAreaView, ScrollView 
} from 'react-native';

const ManualForm = () => {
  const [name, setName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [cellphone, setCellphone] = useState('');
  const [numVisits, setNumVisits] = useState('');
  const [idType, setIdType] = useState('');
  const [purpose, setPurpose] = useState('');

  const handleSubmit = () => {
    console.log({ name, birthday, cellphone, numVisits, idType, purpose });
    alert('Form submitted successfully!');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.form}>
      
        <Text style={styles.label}>Name*</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Surname, First Name" 
          value={name} 
          onChangeText={setName} 
        />

   
        <Text style={styles.label}>Birthday*</Text>
        <TextInput 
          style={styles.input} 
          placeholder="MM/DD/YY" 
          value={birthday} 
          onChangeText={setBirthday} 
        />

       
        <Text style={styles.label}>Cellphone Number*</Text>
        <TextInput 
          style={styles.input} 
          placeholder="+63" 
          keyboardType="phone-pad"
          value={cellphone} 
          onChangeText={setCellphone} 
        />

      
        <Text style={styles.label}>Number of Visit</Text>
        <Text style={styles.subLabel}>As of MM/DD/YY</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Value" 
          keyboardType="numeric"
          value={numVisits} 
          onChangeText={setNumVisits} 
        />

        
        <Text style={styles.label}>ID Type*</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Value" 
          value={idType} 
          onChangeText={setIdType} 
        />


        <Text style={styles.label}>Purpose of Visit</Text>
        <TextInput 
          style={styles.input} 
          placeholder="Value" 
          value={purpose} 
          onChangeText={setPurpose} 
        />

       
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
  },
  form: {
    paddingVertical: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  subLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#333',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ManualForm;
