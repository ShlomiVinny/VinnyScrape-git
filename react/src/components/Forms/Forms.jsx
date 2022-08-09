import { Link, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from '../Navbar/Navbar';
import TableForm from './Form/TableForm';
import InvoiceForm from './Form/InvoiceForm';
import TableCheckForm from './Form/TableCheckForm';
import './Forms.css';


export default function Forms() {
  let activeLink = '';
  function setActiveLink(link = '') {
    activeLink = link;
  }

  const loc = useLocation();
  const path = loc.pathname;
  if (path.endsWith('invoice')) {
    setActiveLink('Invoice');
  } else if (path.endsWith('table')) {
    setActiveLink('Table');
  } else if (path.endsWith('tablecheck')) {
    setActiveLink('Table-Check');
  }

  return (
    <div className="forms">
      <Navbar />
      <h2 className='forms-header'>Forms</h2>
      <div className='forms-links'>
        <Link
          className={`forms-link ${activeLink === "Table" ? 'active' : ''}`}
          to={"table"}
          onClick={(event) => setActiveLink(event.currentTarget.innerText)}>
          Table
        </Link>
        <Link
          className={`forms-link ${activeLink === "Table-Check" ? 'active' : ''}`}
          to={"tablecheck"}
          onClick={(event) => setActiveLink(event.currentTarget.innerText)}>
          Table-Check
        </Link>
        <Link
          className={`forms-link ${activeLink === "Invoice" ? 'active' : ''}`}
          to={"invoice"}
          onClick={(event) => setActiveLink(event.currentTarget.innerText)}>
          Invoice
        </Link>
      </div>
      <div className='forms-outlet'>
        <Routes>
          <Route path={"invoice"} element={<InvoiceForm />} />
          <Route path={"table"} element={<TableForm />} />
          <Route path={"tablecheck"} element={<TableCheckForm />} />
        </Routes>
      </div>
    </div>
  );
};