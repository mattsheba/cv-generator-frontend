import React, { useState, useEffect, useRef } from 'react';
import CVForm from '../components/CVForm';
import CVPreview from '../components/CVPreview';
import WhatsAppButton from '../components/WhatsAppButton';
import './CVGenerator.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import API_BASE_URL from '../config';

// Phone number validation for Zambian numbers
const validatePhoneNumber = (phone) => {
  const pattern = /^(\+?260|0)?[0-9]{9,10}$/;
  return pattern.test(phone.replace(/\s/g, ''));
};

const CVGenerator = () => {
  const [cvData, setCvData] = useState({
    personalInfo: {
      profession: '',
      yearsExperience: '',
      specialization: ''
    },
    skills: [],
    education: [],
    experience: [],
    licensing: [],
    languages: [],
    hobbies: '',
    references: []
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const pollingIntervalRef = useRef(null);
  const pollingTimeoutRef = useRef(null);

  // Check for pending payment on component mount (user returning from Tumeny)
  useEffect(() => {
    const checkPendingPayment = async () => {
      const pendingTransactionId = sessionStorage.getItem('pendingTransactionId');
      const pendingPhone = sessionStorage.getItem('pendingPaymentPhone');
      
      if (pendingTransactionId) {
        // User returned from payment gateway - check status
        toast.info('Checking payment status...');
        
        try {
          const statusResponse = await fetch(`${API_BASE_URL}/api/payment-status/${pendingTransactionId}`);
          const statusData = await statusResponse.json();

          if (statusData.status === 'completed') {
            // Payment successful
            sessionStorage.removeItem('pendingTransactionId');
            sessionStorage.removeItem('pendingPaymentPhone');
            toast.success('Payment successful! Downloading your CV...');
            await downloadPDF(statusData.pdfUrl);
          } else if (statusData.status === 'failed') {
            // Payment failed
            sessionStorage.removeItem('pendingTransactionId');
            sessionStorage.removeItem('pendingPaymentPhone');
            toast.error('Payment was not completed. Please try again.');
          } else {
            // Payment still pending - start polling
            toast.info('Payment pending. Waiting for confirmation...');
            
            // Poll for completion
            pollingIntervalRef.current = setInterval(async () => {
              try {
                const pollResponse = await fetch(`${API_BASE_URL}/api/payment-status/${pendingTransactionId}`);
                const pollData = await pollResponse.json();

                if (pollData.status === 'completed') {
                  clearInterval(pollingIntervalRef.current);
                  sessionStorage.removeItem('pendingTransactionId');
                  sessionStorage.removeItem('pendingPaymentPhone');
                  toast.success('Payment confirmed! Downloading your CV...');
                  await downloadPDF(pollData.pdfUrl);
                } else if (pollData.status === 'failed') {
                  clearInterval(pollingIntervalRef.current);
                  sessionStorage.removeItem('pendingTransactionId');
                  sessionStorage.removeItem('pendingPaymentPhone');
                  toast.error('Payment failed. Please try again.');
                }
              } catch (pollError) {
                console.error('Polling error:', pollError);
              }
            }, 5000); // Check every 5 seconds

            // Stop checking after 5 minutes
            setTimeout(() => {
              if (pollingIntervalRef.current) {
                clearInterval(pollingIntervalRef.current);
                sessionStorage.removeItem('pendingTransactionId');
                sessionStorage.removeItem('pendingPaymentPhone');
                toast.warning('Payment check timed out. If you completed payment, please contact support.');
              }
            }, 300000);
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
          toast.error('Could not verify payment status. Please contact support if you completed payment.');
        }
      }
    };

    checkPendingPayment();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current);
      }
    };
  }, []);

  const handleDataChange = (data) => {
    setCvData(data);
  };

  const handleDownload = async () => {
    // Validate that essential data is filled
    if (!cvData.personalInfo?.fullName || !cvData.personalInfo?.email) {
      toast.error('Please fill in at least your name and email before downloading.');
      return;
    }

    // Validate phone number from CV form
    if (!cvData.personalInfo?.phone) {
      toast.error('Please fill in your phone number in the CV form.');
      return;
    }

    if (!validatePhoneNumber(cvData.personalInfo.phone)) {
      toast.error('Please enter a valid Zambian phone number in the CV form.');
      return;
    }

    setIsProcessing(true);

    try {
      // Generate unique reference for this payment
      const reference = 'CV-' + Date.now() + '-' + Math.random().toString(36).substring(7);
      
      // Store CV data and reference for after payment
      sessionStorage.setItem('pendingCvData', JSON.stringify(cvData));
      sessionStorage.setItem('pendingPaymentReference', reference);

      // Initialize Lenco payment widget
      if (window.LencoPay) {
        window.LencoPay.getPaid({
          key: 'pub-cd353f758b26d57cead328816d6e7691b9f0dcea6f5a9f7b', // Lenco public key
          reference: reference,
          email: cvData.personalInfo.email,
          amount: 50, // ZMW 50
          currency: 'ZMW',
          channels: ['mobile-money'], // Mobile Money only for instant payments
          customer: {
            firstName: cvData.personalInfo.fullName.split(' ')[0] || 'Customer',
            lastName: cvData.personalInfo.fullName.split(' ').slice(1).join(' ') || '',
            phone: cvData.personalInfo.phone.replace(/\D/g, ''),
          },
          onSuccess: async function (response) {
            // Payment completed successfully
            toast.success('Payment successful! Generating your CV...');
            
            try {
              // Send CV data to backend for generation
              const generateResponse = await fetch(`${API_BASE_URL}/api/payment/generate-cv`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  reference: reference,
                  cvData: cvData
                })
              });

              const generateData = await generateResponse.json();

              if (generateData.success && generateData.pdfUrl) {
                // Clear session storage
                sessionStorage.removeItem('pendingCvData');
                sessionStorage.removeItem('pendingPaymentReference');
                
                // Download PDF
                toast.success('Downloading your CV...');
                await downloadPDF(generateData.pdfUrl);
                setIsProcessing(false);
              } else {
                toast.error('Payment successful but CV generation failed. Please contact support with reference: ' + reference);
                setIsProcessing(false);
              }
            } catch (error) {
              console.error('CV generation error:', error);
              toast.error('Payment successful but CV generation failed. Please contact support with reference: ' + reference);
              setIsProcessing(false);
            }
          },
          onClose: function () {
            // User closed payment window
            toast.warning('Payment window closed. No charge was made.');
            sessionStorage.removeItem('pendingCvData');
            sessionStorage.removeItem('pendingPaymentReference');
            setIsProcessing(false);
          },
          onConfirmationPending: function () {
            // Payment pending confirmation
            toast.info('Payment is being confirmed. This may take a few moments...');
            
            // Poll for payment confirmation
            const checkPayment = setInterval(async () => {
              try {
                const verifyResponse = await fetch(`${API_BASE_URL}/api/payment/verify/${reference}`);
                const verifyData = await verifyResponse.json();

                if (verifyData.success && verifyData.status === 'successful') {
                  clearInterval(checkPayment);
                  sessionStorage.removeItem('pendingCvData');
                  sessionStorage.removeItem('pendingPaymentReference');
                  
                  toast.success('Payment confirmed! Downloading your CV...');
                  await downloadPDF(verifyData.pdfUrl);
                  setIsProcessing(false);
                } else if (verifyData.status === 'failed') {
                  clearInterval(checkPayment);
                  toast.error('Payment failed. Please try again.');
                  setIsProcessing(false);
                }
              } catch (error) {
                console.error('Payment check error:', error);
              }
            }, 5000); // Check every 5 seconds

            // Stop checking after 3 minutes
            setTimeout(() => {
              clearInterval(checkPayment);
              if (isProcessing) {
                toast.warning('Payment confirmation taking longer than expected. Please contact support if charged.');
                setIsProcessing(false);
              }
            }, 180000);
          },
        });
      } else {
        toast.error('Payment system not loaded. Please refresh the page and try again.');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Network error. Please check your connection and try again.');
      setIsProcessing(false);
    }
  };

  const downloadPDF = async (pdfUrl) => {
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CV_${cvData.personalInfo.fullName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download CV. Please contact support.');
    }
  };

  return (
    <div className="cv-generator-page">
      <ToastContainer position="top-right" autoClose={5000} />
      
      <header className="page-header">
        <div className="container">
          <h1>🇿🇲 CVPro Zambia</h1>
          <p>Create professional CVs tailored for the Zambian job market</p>
        </div>
      </header>

      <div className="container">
        <div className="generator-layout">
          <div className="form-panel">
            <CVForm onDataChange={handleDataChange} initialData={cvData} />
            <div className="action-buttons">
              <button onClick={handleDownload} className="download-btn">
                Download CV (ZMW 50)
              </button>
            </div>
          </div>

          <div className="preview-panel">
            <div className="preview-sticky">
              <h3>Live Preview</h3>
              <CVPreview data={cvData} />
            </div>
          </div>
        </div>
      </div>

      {/* Website Footer */}
      <footer className="website-footer">
        <div className="footer-content">
          <span>© 2026</span>
          <span>|</span>
          <span>+260770029595</span>
          <span>|</span>
          <span>Powered by Glamified Systems</span>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <WhatsAppButton />
    </div>
  );
};

export default CVGenerator;
