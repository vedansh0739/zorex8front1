'use client';

import { useState } from 'react';
import { 
  Container, 
  Typography, 
  Button, 
  Box, 
  Paper, 
  TextField,
  Grid,
  Alert,
  CardMedia,
  CircularProgress,
  Modal,
  Backdrop,
  Fade,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import UploadIcon from '@mui/icons-material/Upload';

import { styled } from '@mui/material/styles';
const JsonView = ({ data, depth = 0 }) => {
  if (typeof data !== 'object' || data === null) {
    return <Typography component="span">{JSON.stringify(data)}</Typography>;
  }

  const isArray = Array.isArray(data);

  return (
    <Box sx={{ ml: depth * 2 }}>
      {Object.entries(data).map(([key, value], index) => (
        <Box key={key} sx={{ mb: 1 }}>
          <Typography component="span" color="primary">
            {isArray ? '' : `${key}: `}
          </Typography>
          {typeof value === 'object' && value !== null ? (
            <>
              <Typography component="span">{isArray ? '[' : '{'}</Typography>
              <JsonView data={value} depth={depth + 1} />
              <Typography component="span" sx={{ ml: depth * 2 }}>
                {isArray ? ']' : '}'}
              </Typography>
            </>
          ) : (
            <Typography component="span" color="text.secondary">
              {JSON.stringify(value)}
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
};

const DiffView = ({ po, gr, invoice }) => {
  console.log('po1')
  console.log(po)
  console.log('gr1')

  console.log(gr)
  console.log('invoice1')

  console.log(invoice)
  const renderDiff = (field, poValue, grValue, invoiceValue) => {
    const allMatch = poValue === grValue && poValue === invoiceValue;
    return (
      <Box key={field} mb={2}>
        <Typography variant="h6">{field}:</Typography>
        <Box display="flex" justifyContent="space-between">
          <Paper elevation={3} sx={{ p: 1, backgroundColor: allMatch ? 'success.light' : 'error.light', flexGrow: 1, mr: 1 }}>
            <Typography>Purchase Order: {poValue}</Typography>
          </Paper>
          <Paper elevation={3} sx={{ p: 1, backgroundColor: allMatch ? 'success.light' : 'error.light', flexGrow: 1, mr: 1 }}>
            <Typography>Goods Receipt: {grValue}</Typography>
          </Paper>
          <Paper elevation={3} sx={{ p: 1, backgroundColor: allMatch ? 'success.light' : 'error.light', flexGrow: 1 }}>
            <Typography>Invoice: {invoiceValue}</Typography>
          </Paper>
        </Box>
      </Box>
    );
  };



  return (
    <Box>
    
      {renderDiff('Total Amount', po?.total_amount, gr?.total_amount, invoice?.total_amount)}
      <Typography variant="h5">Items:</Typography>
      {po?.line_items?.map((item) => {
        const grItem = gr?.line_items?.find(grItem => grItem?.name === item?.name);
        const invoiceItem = invoice?.line_items?.find(invItem => invItem?.name === item?.name);

        return (
          <Box key={item?.name} ml={2} mb={10}>
            <Box mb={2}>
              <Typography variant="h6">Name:</Typography>
              <Box display="flex" justifyContent="space-between">
                <Paper elevation={3} sx={{ p: 1, backgroundColor: 'success.light', flexGrow: 1 }}>
                  <Typography>{item?.name}</Typography>
                </Paper>
              </Box>
            </Box>

            {renderDiff('Quantity', item?.quantity, grItem?.quantity, invoiceItem?.quantity)}
            {renderDiff('Unit Price', item?.unit_price, grItem?.['unit_price'], invoiceItem?.['unit_price'])}
          </Box>
        );
      })}
   
    </Box>
  );
};

const field_aliases = {
  'order_id': ['order id', 'id', 'order_id', 'purchase_order_number', 'po_number'],
  'invoice_number': ['invoice number', 'invoice_number', 'invoice_id', 'bill_number'],
  'receipt_number': ['receipt number', 'receipt_number', 'receipt_id', 'goods_receipt_number'],
  'line_items':['line_items'],
  'items': ['items', 'goods', 'products', 'product list', 'line items', 'order_items', 'order items', 'product_list', 'item_list'],
  'order_date': ['order date', 'purchase date', 'po date', 'order_date', 'purchase_date', 'po_date'],
  'goods_receipt_date': ['goods receipt date', 'gr date', 'receipt date', 'goods_receipt_date', 'gr_date', 'receipt_date'],
  'invoice_date': ['invoice date', 'bill date', 'invoice_date', 'bill_date'],
  'payment_due_date': ['payment due date', 'due date', 'payment deadline', 'payment_due_date', 'due_date', 'payment_deadline'],




  'total_amount': ['line total', 'total amount', 'total', 'amount', 'invoice total', 'total_amount', 'invoice_total', 'grand_total', 'order_total', 'final_amount', 'line_total', 'total_in_usd', 'total in usd', 'total_in_inr', 'total in inr', 'amount payable', 'total', 'total amount (inr)', 'total amount:'],

  'unit_price': ['rate', 'unit price', 'price', 'cost per unit', 'unit_price', 'price_per_unit', 'item_price', 'unit_cost', 'per_item_price', 'rate / item', 'rate / item (inr)'],

  'quantity': ['quantity', 'qty', 'count', 'number', 'item_count', 'product_quantity', 'order_quantity','qty received' ],

  'name': ['description', 'item name', 'item description', 'product_name', 'product_description', 'item_description', 'goods_description', 'item & description', 'name', 'item'],

  'tax': ['tax', 'vat', 'sales_tax', 'tax_amount', 'vat_amount'],
  'shipping': ['shipping', 'freight', 'shipping_cost', 'delivery_fee', 'transport_cost'],

  'discount': ['discount', 'rebate', 'discount_amount', 'price_reduction', 'savings'],

  'item_code': ['item code', 'product code', 'sku', 'item_number', 'product_id', 'item_id', 'part_number'],

  'shipping_address': ['shipping address', 'delivery address', 'ship to', 'destination', 'shipping_address', 'delivery_address', 'ship_to', 'destination_address'],

  'vendor_address': ['vendor address', 'supplier address', 'from address', 'seller address', 'vendor_address', 'supplier_address', 'from_address', 'seller_address'],


  
};

const normalizeFieldName = (field) => {
  const fieldLower = field.toLowerCase();
  for (const [canonical, variations] of Object.entries(field_aliases)) {
    if (variations.map(v => v.toLowerCase()).includes(fieldLower)) {
      return canonical;
    }
  }
  return field;
};


const normalizeDict = (data) => {
  const normalizedData = {};
  for (const [key, value] of Object.entries(data)) {
    const normalizedKey = normalizeFieldName(key);
    if (Array.isArray(value)) {
      normalizedData[normalizedKey] = value.map(normalizeDict);
    } else {
      normalizedData[normalizedKey] = value;
    }
  }
  return normalizedData;
};

const matchPoGrInvoice = (po, gr, invoice, setNormDiffViewData) => {
  const poNormalized = normalizeDict(po);
  const grNormalized = normalizeDict(gr);
  const invoiceNormalized = normalizeDict(invoice);

  setNormDiffViewData({
    po: poNormalized,
    gr: grNormalized,
    invoice: invoiceNormalized
  });

  const messages = [];

  for (const poItem of poNormalized?.['line_items'] ?? []) {
    const itemId = poItem?.['name']?.toLowerCase();
    const grItem = grNormalized?.['line_items']?.find(item => item?.['name']?.toLowerCase() === itemId);
    if (!grItem) {
      if (itemId) messages.push(`Item ${itemId} not found in Goods Receipt`);
      continue;
    }
    
    const invoiceItem = invoiceNormalized?.['line_items']?.find(item => item?.['name']?.toLowerCase() === itemId);
    if (!invoiceItem) {
      if (itemId) messages.push(`Item ${itemId} not found in Invoice`);
      continue;
    }

    if ((poItem?.['quantity'] || grItem?.['quantity']) && poItem?.['quantity'] !== grItem?.['quantity']) {
      messages.push(`Quantity mismatch for Item ${itemId} in PO and GR`);
    }
    
    if ((poItem?.['quantity'] || invoiceItem?.['quantity']) && poItem?.['quantity'] !== invoiceItem?.['quantity']) {
      messages.push(`Quantity mismatch for Item ${itemId} in PO and Invoice`);
    }
    
    if ((poItem?.['total_amount'] || grItem?.['total_amount']) && poItem?.['total_amount'] !== grItem?.['total_amount']) {
      messages.push(`Total amount mismatch for Item ${itemId} in PO and GR`);
    }  
    if ((poItem?.['total_amount'] || invoiceItem?.['total_amount']) && poItem?.['total_amount'] !== invoiceItem?.['total_amount']) {
      messages.push(`Total amount mismatch for Item ${itemId} in PO and Invoice`);
    }

    if ((poItem?.['unit_price'] || grItem?.['unit_price']) && poItem?.['unit_price'] !== grItem?.['unit_price']) {
      messages.push(`Unit price mismatch for Item ${itemId} in PO and GR`);
    }  
    if ((poItem?.['unit_price'] || invoiceItem?.['unit_price']) && poItem?.['unit_price'] !== invoiceItem?.['unit_price']) {
      messages.push(`Unit price mismatch for Item ${itemId} in PO and Invoice`);
    }
  }

  if ((poNormalized?.['total_amount'] || invoiceNormalized?.['total_amount']) && poNormalized?.['total_amount'] !== invoiceNormalized?.['total_amount']) {
    messages.push("Total amount mismatch between PO and Invoice");
  }
  if ((poNormalized?.['total_amount'] || grNormalized?.['total_amount']) && poNormalized?.['total_amount'] !== grNormalized?.['total_amount']) {
    messages.push("Total amount mismatch between PO and GR");
  }

  const isMatch = messages.length === 0;
  return [isMatch, messages.length > 0 ? messages : ["Three-way match successful"]];
};
const Input = styled('input')({
  display: 'none',
});

export default function Home() {

  const [normDiffViewData,setNormDiffViewData]=useState(null);
  const handleMatchCheck = (result) => {
    try {
      if (!result || typeof result !== 'object') {
        throw new Error('Invalid result object');
      }

      const { purchase_order, goods_receipt, invoice } = result;

      if (!purchase_order || !goods_receipt || !invoice) {
        throw new Error('Missing required data in result object');
      }

      const po = purchase_order?.result;
      const gr = goods_receipt?.result;
      const invoice_data = invoice?.result;

      if (!po || !gr || !invoice_data) {
        throw new Error('Missing result data in one or more documents');
      }

      const [isMatch, messages] = matchPoGrInvoice(po, gr, invoice_data, setNormDiffViewData);
      setMatchResult({ isMatch, messages });

    } catch (error) {
      console.error('Error in handleMatchCheck:', error);
      setMatchResult({ 
        isMatch: false, 
        messages: [
          "An error occurred while processing the data.",
          `Error details: ${error.message}`
        ] 
      });
      setNormDiffViewData(null);
    }
  };
  const [purchaseOrderImage, setPurchaseOrderImage] = useState(null);
  const [goodsReceiptImage, setGoodsReceiptImage] = useState(null);
  const [invoiceImage, setInvoiceImage] = useState(null);
  const [purchaseOrderText, setPurchaseOrderText] = useState('');
  const [goodsReceiptText, setGoodsReceiptText] = useState('');
  const [invoiceText, setInvoiceText] = useState('');
  const [matchResult, setMatchResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (event, setImageFunction) => {
    const file = event.target.files[0];
    if (file) {
      setImageFunction(URL.createObjectURL(file));
    }
  };

  const processImages = async () => {
    setLoading(true);
    const formData = new FormData();
    
    const images = [
      { file: purchaseOrderImage, key: 'purchase_order' },
      { file: goodsReceiptImage, key: 'goods_receipt' },
      { file: invoiceImage, key: 'invoice' }
    ];
  
    for (const image of images) {
      const blob = await fetch(image.file).then(r => r.blob());
      formData.append(image.key, blob, `${image.key}.jpg`);
    }
  
    try {
      const response = await fetch('http://ec2-65-2-69-222.ap-south-1.compute.amazonaws.com:8000/', {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const result = await response.json();
      // Lowercase all values in the result object
      const lowercaseValues = (obj) => {
        if (typeof obj !== 'object' || obj === null) {
          return typeof obj === 'string' ? obj.toLowerCase() : obj;
        }
        
        if (Array.isArray(obj)) {
          return obj.map(lowercaseValues);
        }
        
        return Object.fromEntries(
          Object.entries(obj).map(([key, value]) => [key, lowercaseValues(value)])
        );
      };

      result.purchase_order.result = lowercaseValues(result.purchase_order.result);
      result.goods_receipt.result = lowercaseValues(result.goods_receipt.result);
      result.invoice.result = lowercaseValues(result.invoice.result);
      setPurchaseOrderText(JSON.stringify(result?.purchase_order?.result, null, 2));
      setGoodsReceiptText(JSON.stringify(result?.goods_receipt?.result, null, 2));
      setInvoiceText(JSON.stringify(result?.invoice?.result, null, 2));

      handleMatchCheck(result);
    } catch (error) {
      console.error('Error:', error);
      setPurchaseOrderText('Error occurred while processing the images.');
      setGoodsReceiptText('Error occurred while processing the images.');
      setInvoiceText('Error occurred while processing the images.');

    } finally {
      setLoading(false);
    }
  };


  const allImagesUploaded = purchaseOrderImage && goodsReceiptImage && invoiceImage;
  const renderJsonView = (jsonString) => {
    try {
      const jsonData = JSON.parse(jsonString);
      return (
        <Box sx={{ maxHeight: '400px', overflow: 'auto', bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
          <JsonView data={jsonData} />
        </Box>
      );
    } catch (error) {
      return <Typography color="error">Invalid JSON data</Typography>;
    }
  };
  const [fullscreenImage, setFullscreenImage] = useState(null);

  // ... other functions

  const handleImageClick = (imageSrc) => {
    setFullscreenImage(imageSrc);
  };

  const handleCloseFullscreen = () => {
    setFullscreenImage(null);
  };
  return (
    <>
    <Box display="flex" alignItems="center" sx={{pl:2.8}}>
      <svg

        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <Typography 
        variant="h2" 
        component="h1" 
        gutterBottom
        sx={{
          fontFamily: 'var(--font-inter)',
          fontWeight: 700,
          fontSize: '2.2rem',
          pt:1.8,pl:1,
          letterSpacing: '-0.06em',
        }}
      >
        Zorex
      </Typography>


      <Box
        sx={{ml:1,mt:0.8,
          backgroundColor: 'grey.200',
          borderRadius: '16px',
          padding: '4px 8px',
          display: 'inline-block',
          border: '0.5px solid black',
        }}
      >
        <Typography 
          variant="h2" 
          component="h1" 
          gutterBottom
          sx={{
            fontFamily: 'var(--font-inter)',
            fontWeight: 800,
            fontSize: '1rem',
            letterSpacing: '-0.06em',
            margin: 0,
          }}
        >
          v1.2
        </Typography>
      </Box>
    </Box>
    <Container maxWidth="md">
      
      <Box sx={{ my: 4 ,animation: 'fadeInFromTop 0.2s ease-out',
            '@keyframes fadeInFromTop': {
              '0%': {
                opacity: 0,
                transform: 'translateY(-20px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },}}>
        <Typography 
          variant="body1"
          sx={{
            fontFamily: 'var(--font-inter)',
            fontWeight: 700,
            color: '#555555',
            fontSize: '1rem',
            letterSpacing: '-0.02em',
            
          }} 
          paragraph
        >
          Upload your purchase order, goods receipt, and invoice images to perform a cross-check and get flagged for any discrepancies found.
        </Typography>
        
        <Grid container spacing={3}>
          {[
            { title: 'Purchase Order', id: 'purchaseOrderInput', image: purchaseOrderImage, setImage: setPurchaseOrderImage },
            { title: 'Goods Receipt', id: 'goodsReceiptInput', image: goodsReceiptImage, setImage: setGoodsReceiptImage },
            { title: 'Invoice', id: 'invoiceInput', image: invoiceImage, setImage: setInvoiceImage }
          ].map((item, index) => (
            <Grid item xs={12} md={4} key={index} >
              <Paper elevation={3} sx={{ p: 2, pl: 3, height: '100%', display: 'flex', flexDirection: 'column', borderRadius: '36px', boxShadow: '0px 1px 10px rgba(0, 0, 0, 0.1)' }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{
    fontFamily: 'var(--font-inter)',
    fontWeight: 600,
    letterSpacing: '-0.02em', // Slightly tighter letter spacing for a modern look
  }}>
                  {item.title}
                </Typography>
                
                {item.image && (
                  <Box  sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
         
                    <CardMedia
                      component="img"
                      image={item.image}
                      alt={`Uploaded ${item.title}`}
                      sx={{ 
                        flexGrow: 1,
                        objectFit: 'contain',
                        cursor: 'pointer' 
                      }}
                      onClick={() => handleImageClick(item.image)}
                    />
                  </Box>
                )}
                <label htmlFor={item.id}>
                  <Input
                    accept="image/*"
                    id={item.id}
                    type="file"
                    onChange={(e) => handleImageUpload(e, item.setImage)}
                    style={{ display: 'none' }}
                  />
                  <IconButton
                    component="span"
                  >
                    <UploadIcon />
                  </IconButton>
                </label>
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Modal
          open={!!fullscreenImage}
          onClose={handleCloseFullscreen}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={!!fullscreenImage}>
            <Box sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '70vw',
              height: '90vh',
              bgcolor: 'background.paper',
              boxShadow: 24,
              p: 4,
              outline: 'none',
            }}>
              <IconButton
                aria-label="close"
                onClick={handleCloseFullscreen}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: 8,
                  color: (theme) => theme.palette.grey[500],
                }}
              >
                <CloseIcon />
              </IconButton>
              <CardMedia
                component="img"
                image={fullscreenImage}
                alt="Fullscreen image"
                sx={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'contain' 
                }}
              />
            </Box>
          </Fade>
        </Modal>

        <Box mt={5}>
          <Button 
            variant="contained" 
            color="grey" 
            onClick={processImages} 
            disabled={!allImagesUploaded || loading}
            sx={{
              fontFamily: 'var(--font-inter)',
              fontWeight: 900,
              letterSpacing: '-0.02em', // Slightly tighter letter spacing for a modern look
            }}
          >
            Perform 3 way check
          </Button>
        </Box>

        {loading && (
          <Box mt={2} display="flex" justifyContent="center">
            <CircularProgress />
          </Box>
        )}
        {matchResult && (
  <Box mt={3}>
    <Typography variant="h6" gutterBottom sx={{
            fontFamily: 'var(--font-inter)',
            fontWeight: 700,
            color: '#555555',
            fontSize: '1rem',
            letterSpacing: '-0.02em',
            mt:7
            
          }} >
      Match Result:
    </Typography>
    <Alert severity={matchResult?.isMatch ? "success" : "error"}>
      {matchResult?.isMatch ? (
        matchResult?.messages?.[0]
      ) : (
        <>
          <Typography variant="subtitle1" gutterBottom>
            The following issues were found:
          </Typography>
          <ul>
            {matchResult?.messages?.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        </>
      )}
    </Alert>
  </Box>
)}


{normDiffViewData && (
        <Box mt={3}>
          <Typography variant="h5" gutterBottom sx={{
            fontFamily: 'var(--font-inter)',
            fontWeight: 700,
            color: '#555555',
            fontSize: '1.5rem',
            letterSpacing: '-0.02em',
            
          }} >
            Detailed Comparison:
          </Typography>
          <Paper elevation={3} sx={{ p: 3, height: '100%',  flexDirection: 'column', borderRadius: '36px', boxShadow: '0px 1px 10px rgba(0, 0, 0, 0.1)' }}>
                      <DiffView po={normDiffViewData?.po} gr={normDiffViewData?.gr} invoice={normDiffViewData?.invoice} />
                      </Paper>

        </Box>
      )}
     
     
     

      {(purchaseOrderText || goodsReceiptText || invoiceText) && (<>

<Box mt={9} sx={{ position: 'relative', height: '20px', overflow: 'hidden' }}>
<svg
  viewBox="0 0 1440 40"
  preserveAspectRatio="none"
  style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
  }}
>
  <path
    d="M0,20 Q15,5 30,20 T60,20 T90,20 T120,20 T150,20 T180,20 T210,20 T240,20 T270,20 T300,20 T330,20 T360,20 T390,20 T420,20 T450,20 T480,20 T510,20 T540,20 T570,20 T600,20 T630,20 T660,20 T690,20 T720,20 T750,20 T780,20 T810,20 T840,20 T870,20 T900,20 T930,20 T960,20 T990,20 T1020,20 T1050,20 T1080,20 T1110,20 T1140,20 T1170,20 T1200,20 T1230,20 T1260,20 T1290,20 T1320,20 T1350,20 T1380,20 T1410,20 T1440,20"
    fill="none"
    stroke="#a0a0a0"
    strokeWidth="10"
  />
</svg>
</Box>
        <Grid container spacing={3} mt={7}>
          {[
            { title: 'Purchase Order', state: purchaseOrderText },
            { title: 'Goods Receipt', state: goodsReceiptText },
            { title: 'Invoice', state: invoiceText }
          ].map((item, index) => (
            <Grid item xs={12} key={index}>
              <Paper elevation={3} sx={{ p: 3, height: '100%',  flexDirection: 'column', borderRadius: '36px', boxShadow: '0px 1px 10px rgba(0, 0, 0, 0.1)' }}>
                <Typography variant="h6" gutterBottom>
                  Extracted {item.title} Text:
                </Typography>
                {renderJsonView(item?.state)}
              </Paper>
            </Grid>
          ))}
        </Grid></>
      )}


      </Box>

  

      
    </Container>
    </>
  );
}