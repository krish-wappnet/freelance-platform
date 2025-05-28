'use client';

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { Payment } from '@prisma/client';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  header: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 10,
  },
  title: {
    fontSize: 14,
    marginBottom: 5,
    textDecoration: 'underline',
  },
  text: {
    marginBottom: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 10,
  },
});

interface InvoiceDocumentProps {
  payment: Payment & {
    contract: {
      project: {
        title: string;
      };
      client: {
        name: string;
        email: string;
      };
      freelancer: {
        name: string;
        email: string;
      };
    };
    milestone: {
      title: string;
    };
  };
}

export const InvoiceDocument = ({ payment }: InvoiceDocumentProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.header}>Invoice</Text>

      <View style={styles.section}>
        <Text style={styles.text}>Invoice Number: {payment.id}</Text>
        <Text style={styles.text}>Date: {format(payment.createdAt, 'PPP')}</Text>
        <Text style={styles.text}>Status: {payment.status}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Project Details</Text>
        <Text style={styles.text}>Project: {payment.contract.project.title}</Text>
        <Text style={styles.text}>Milestone: {payment.milestone.title}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Client Details</Text>
        <Text style={styles.text}>Name: {payment.contract.client.name}</Text>
        <Text style={styles.text}>Email: {payment.contract.client.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Freelancer Details</Text>
        <Text style={styles.text}>Name: {payment.contract.freelancer.name}</Text>
        <Text style={styles.text}>Email: {payment.contract.freelancer.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Payment Details</Text>
        <Text style={styles.text}>Amount: ₹{payment.amount.toFixed(2)}</Text>
        <Text style={styles.text}>Transaction ID: {payment.paymentIntentId}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.title}>Terms and Conditions</Text>
        <Text style={styles.text}>This invoice is automatically generated and is valid without signature.</Text>
      </View>

      <Text style={styles.footer}>Thank you for your business!</Text>
    </Page>
  </Document>
); 