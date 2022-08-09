import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import outputs from './outputs.json';
import store from './store';

import HomePage from './components/Home/Home';
import Forms from './components/Forms/Forms';
import ScreenshotsPage from './components/ScreenshotsPage/ScreenshotsPage';
import ScrapingPage from './components/ScrapingPage/ScrapingPage';
import StatisticsPage from './components/Statistics/Statistics';

export default function AppRoutes() {

    return (
        <Provider store={store}>
            <BrowserRouter>
                <Routes>
                    <Route index element={<HomePage />} />
                    <Route path='/' element={<HomePage />} />
                    <Route path={outputs.VinnyScrape_fill_path.value.concat('/*')} element={<Forms />} />
                    <Route path='scraping/*' element={<ScrapingPage />} />
                    <Route path='screenshots' element={<ScreenshotsPage />} />
                    <Route path='statistics' element={<StatisticsPage />} />

                </Routes>
            </BrowserRouter>
        </Provider>
    )
};