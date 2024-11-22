import React, {useContext, useEffect, useState} from 'react';
import {Card, Col, Container, Form, Row} from 'react-bootstrap';
import {SettingsContext} from '../contexts/SettingsContext.tsx';

function SettingsPage() {
    const {settingsData, updateSettingsData} = useContext(SettingsContext);
    const [localSettings, setLocalSettings] = useState(settingsData);

    useEffect(() => {
        setLocalSettings(settingsData);
    }, [settingsData]);

    const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, checked} = e.target;
        const updatedSettings = {
            ...localSettings,
            [name]: checked,
        };

        setLocalSettings(updatedSettings);
        updateSettingsData(updatedSettings);
    };

    // Reusable function to render Form.Check switches
    const renderSwitch = (name: keyof typeof localSettings, displayText: string) => (
        <Form.Check
            type="switch"
            id={name}
            label={displayText}
            name={name}
            checked={localSettings[name] as boolean}
            onChange={handleSettingsChange}
        />
    );

    return (
        <Container>
            <h1 className="md-4">Application Settings</h1>
            <Row>
                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title>Appearance</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">
                                Basic vanity options.
                            </Card.Subtitle>
                            <Form>
                                {renderSwitch('darkMode', 'Enable Dark Mode')}
                                {renderSwitch('fullscreenModals', 'Open Modals in Fullscreen')}
                                {renderSwitch('showPillsInTable', 'Show Tags Inline in Table')}
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={6}>
                    <Card className="mb-4">
                        <Card.Body>
                            <Card.Title>Behaviour</Card.Title>
                            <Card.Subtitle className="mb-2 text-muted">
                                Options to customise the clip player.
                            </Card.Subtitle>
                            <Form>
                                {renderSwitch('startClipsWithSound', 'Start Clips with Sound')}
                                {renderSwitch('autoplayClips', 'Autoplay Clips')}
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export {SettingsPage};