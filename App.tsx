import React, {useState} from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import PDFReader from 'react-native-pdf';
import {
  storePdfTemplateCache,
  fillPdf,
  downloadPDF,
} from './src/utils/PDFUtils';

interface AppProps {}

interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  phoneArea: string;
  phoneNumber: string;
}

const TEMPLATE_URL =
  'https://firebasestorage.googleapis.com/v0/b/rfahmi-id.appspot.com/o/docs%2Facroform.pdf?alt=media&token=f3fc84be-e296-44b8-a9fc-162cf4ae08a8';

const styles = {
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
    textAlign: 'center',
  },
  buttonContainer: {},
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
  pdfReader: {
    flex: 1,
    height: 500,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
  },
  textInput: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  row: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  loadingContainer: {
    flex: 1,
    height: 400,
    alignItems: 'center',
    justifyContent: 'center',
  },
};

const App: React.FC<AppProps> = () => {
  const [userData, setUserData] = useState<UserData>({
    firstName: 'Nur',
    lastName: 'Fahmi',
    email: 'hello@rfahmi.com',
    phoneArea: '+62',
    phoneNumber: '8121328512',
  });

  const [filledPdfPath, setFilledPdfPath] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const download = async (path: string) => {
    const downloadedPath = await downloadPDF(path, 'PDF_Download.pdf');

    if (downloadedPath) {
      console.log('PDF downloaded successfully:', downloadedPath);
    }
  };

  const generatePDF = async () => {
    setLoading(true);
    setFilledPdfPath(null);
    const templatePath = await storePdfTemplateCache(TEMPLATE_URL);

    if (templatePath) {
      const fieldMappings = {
        'name[first]': userData.firstName,
        'name[last]': userData.lastName,
        email: userData.email,
        'phone[area]': userData.phoneArea,
        'phone[phone]': userData.phoneNumber,
      };
      fillPdf(templatePath, fieldMappings)
        .then(path => path && setFilledPdfPath(path))
        .catch(e => console.error(e))
        .finally(() => setLoading(false));
    }
  };

  return (
    <SafeAreaView>
      <ScrollView style={styles.container}>
        <View style={styles.buttonContainer}>
          <Text style={styles.title}>React Native PDF AcroForm</Text>
          <Text style={styles.label}>Name</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.textInput}
              placeholder="First Name"
              value={userData.firstName}
              onChangeText={text => setUserData({...userData, firstName: text})}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Last Name"
              value={userData.lastName}
              onChangeText={text => setUserData({...userData, lastName: text})}
            />
          </View>
          <Text style={styles.label}>Email</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.textInput}
              placeholder="Email"
              value={userData.email}
              onChangeText={text => setUserData({...userData, email: text})}
            />
          </View>
          <Text style={styles.label}>Phone</Text>
          <View style={styles.row}>
            <TextInput
              style={styles.textInput}
              placeholder="Phone Area"
              value={userData.phoneArea}
              onChangeText={text => setUserData({...userData, phoneArea: text})}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Phone Number"
              value={userData.phoneNumber}
              onChangeText={text =>
                setUserData({...userData, phoneNumber: text})
              }
            />
          </View>
          <TouchableOpacity style={styles.button} onPress={generatePDF}>
            <Text style={styles.buttonText}>Generate PDF</Text>
          </TouchableOpacity>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#007bff" />
            </View>
          ) : (
            filledPdfPath && (
              <>
                {filledPdfPath ? (
                  <PDFReader
                    style={styles.pdfReader}
                    maxScale={1}
                    minScale={1}
                    source={{uri: filledPdfPath}}
                  />
                ) : (
                  <PDFReader
                    style={styles.pdfReader}
                    maxScale={1}
                    minScale={1}
                    source={{uri: TEMPLATE_URL}}
                  />
                )}
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => download(filledPdfPath)}>
                  <Text style={styles.buttonText}>Download Generated PDF</Text>
                </TouchableOpacity>
              </>
            )
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default App;
