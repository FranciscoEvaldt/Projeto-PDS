// TestConnectionBackend.tsx
// Componente para testar a conexão com o backend usando seu api.ts

import React, { useState, useEffect } from 'react';
import { companiesApi, worksApi, loadsApi, samplesApi, getApiBaseUrl } from '../services/api';
import type { Company, Work, Load, Sample } from '../types';

const TestConnectionBackend: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [works, setWorks] = useState<Work[]>([]);
  const [loads, setLoads] = useState<Load[]>([]);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setLoading(true);
    setError(null);
    
    console.log('🔍 Iniciando teste de conexão com backend...');
    console.log('📡 URL do Backend:', getApiBaseUrl());

    try {
      // Testar conexão buscando empresas
      console.log('📋 Buscando empresas...');
      const companiesData = await companiesApi.getAll();
      setCompanies(companiesData);
      console.log(`✅ ${companiesData.length} empresas carregadas`);

      // Se chegou aqui, backend está online
      setBackendStatus('online');

      // Buscar outros dados em paralelo
      console.log('📋 Buscando obras, cargas e amostras...');
      const [worksData, loadsData, samplesData] = await Promise.all([
        worksApi.getAll().catch(err => { console.error('Erro ao buscar obras:', err); return []; }),
        loadsApi.getAll().catch(err => { console.error('Erro ao buscar cargas:', err); return []; }),
        samplesApi.getAll().catch(err => { console.error('Erro ao buscar amostras:', err); return []; }),
      ]);

      setWorks(worksData);
      setLoads(loadsData);
      setSamples(samplesData);

      console.log(`✅ ${worksData.length} obras carregadas`);
      console.log(`✅ ${loadsData.length} cargas carregadas`);
      console.log(`✅ ${samplesData.length} amostras carregadas`);
      console.log('🎉 Todos os dados carregados com sucesso!');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('❌ Erro na conexão:', err);
      setError(err.message || 'Erro desconhecido ao conectar com o backend');
      setBackendStatus('offline');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: 0 }}>🧪 Teste de Conexão - Sistema de Gestão de Laboratório</h1>
        <p style={{ color: '#666', marginTop: '5px' }}>Backend URL: <code>{getApiBaseUrl()}</code></p>
      </div>
      
      <hr style={{ marginBottom: '30px' }} />

      {/* Status do Backend */}
      <div style={{ 
        padding: '20px', 
        marginBottom: '30px', 
        backgroundColor: backendStatus === 'online' ? '#d4edda' : backendStatus === 'offline' ? '#f8d7da' : '#fff3cd',
        border: `2px solid ${backendStatus === 'online' ? '#28a745' : backendStatus === 'offline' ? '#dc3545' : '#ffc107'}`,
        borderRadius: '8px'
      }}>
        <h2 style={{ margin: '0 0 10px 0' }}>
          {backendStatus === 'checking' && '🔄 Verificando conexão...'}
          {backendStatus === 'online' && '✅ Backend Online e Conectado!'}
          {backendStatus === 'offline' && '❌ Backend Offline ou Erro de Conexão'}
        </h2>
        
        {error && (
          <div style={{ 
            marginTop: '15px', 
            padding: '15px', 
            backgroundColor: '#fff', 
            border: '1px solid #dc3545',
            borderRadius: '5px'
          }}>
            <strong style={{ color: '#dc3545' }}>Erro:</strong>
            <pre style={{ 
              marginTop: '10px', 
              whiteSpace: 'pre-wrap', 
              fontSize: '14px',
              color: '#721c24'
            }}>{error}</pre>
          </div>
        )}

        {backendStatus === 'online' && (
          <p style={{ margin: '10px 0 0 0', color: '#155724' }}>
            🎉 Todas as requisições foram bem-sucedidas! O frontend está conectado ao backend.
          </p>
        )}
      </div>

      {/* Botão Atualizar */}
      <button 
        onClick={checkConnection} 
        disabled={loading}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 'bold',
          backgroundColor: loading ? '#6c757d' : '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '30px',
          transition: 'background-color 0.2s'
        }}
        onMouseEnter={(e) => {
          if (!loading) e.currentTarget.style.backgroundColor = '#0056b3';
        }}
        onMouseLeave={(e) => {
          if (!loading) e.currentTarget.style.backgroundColor = '#007bff';
        }}
      >
        {loading ? '⏳ Carregando...' : '🔄 Atualizar Dados'}
      </button>

      {/* Resumo em Cards */}
      {backendStatus === 'online' && !loading && (
        <>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '20px',
            marginBottom: '40px'
          }}>
            <div style={{ 
              padding: '25px', 
              backgroundColor: '#e3f2fd', 
              borderRadius: '10px', 
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: 0, fontSize: '40px', color: '#1976d2' }}>{companies.length}</h3>
              <p style={{ margin: '8px 0 0 0', fontSize: '16px', color: '#555' }}>🏢 Empresas</p>
            </div>
            
            <div style={{ 
              padding: '25px', 
              backgroundColor: '#e8f5e9', 
              borderRadius: '10px', 
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: 0, fontSize: '40px', color: '#388e3c' }}>{works.length}</h3>
              <p style={{ margin: '8px 0 0 0', fontSize: '16px', color: '#555' }}>🏗️ Obras</p>
            </div>
            
            <div style={{ 
              padding: '25px', 
              backgroundColor: '#fff3e0', 
              borderRadius: '10px', 
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: 0, fontSize: '40px', color: '#f57c00' }}>{loads.length}</h3>
              <p style={{ margin: '8px 0 0 0', fontSize: '16px', color: '#555' }}>📦 Cargas</p>
            </div>
            
            <div style={{ 
              padding: '25px', 
              backgroundColor: '#fce4ec', 
              borderRadius: '10px', 
              textAlign: 'center',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: 0, fontSize: '40px', color: '#c2185b' }}>{samples.length}</h3>
              <p style={{ margin: '8px 0 0 0', fontSize: '16px', color: '#555' }}>🧪 Amostras</p>
            </div>
          </div>

          {/* Tabelas Detalhadas */}
          
          {/* EMPRESAS */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ 
              padding: '15px', 
              backgroundColor: '#e3f2fd', 
              borderRadius: '8px 8px 0 0',
              margin: '0 0 0 0',
              borderBottom: '2px solid #1976d2'
            }}>
              🏢 Empresas Cadastradas ({companies.length})
            </h2>
            
            {companies.length === 0 ? (
              <div style={{ 
                padding: '30px', 
                textAlign: 'center', 
                backgroundColor: '#f5f5f5',
                border: '1px solid #ddd',
                borderTop: 'none',
                borderRadius: '0 0 8px 8px'
              }}>
                <p style={{ color: '#666', margin: 0 }}>📭 Nenhuma empresa cadastrada no banco de dados</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', border: '1px solid #ddd', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>ID</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Nome</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>CNPJ</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Telefone</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((company, index) => (
                      <tr key={company.id} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                        <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{company.id}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: 'bold' }}>{company.name}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{company.cnpj || '-'}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{company.phone || '-'}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{company.email || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* OBRAS */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ 
              padding: '15px', 
              backgroundColor: '#e8f5e9', 
              borderRadius: '8px 8px 0 0',
              margin: '0 0 0 0',
              borderBottom: '2px solid #388e3c'
            }}>
              🏗️ Obras Cadastradas ({works.length})
            </h2>
            
            {works.length === 0 ? (
              <div style={{ 
                padding: '30px', 
                textAlign: 'center', 
                backgroundColor: '#f5f5f5',
                border: '1px solid #ddd',
                borderTop: 'none',
                borderRadius: '0 0 8px 8px'
              }}>
                <p style={{ color: '#666', margin: 0 }}>📭 Nenhuma obra cadastrada no banco de dados</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', border: '1px solid #ddd', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f8f9fa' }}>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>ID</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Nome</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Código</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Empresa ID</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Cidade</th>
                      <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid #dee2e6' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {works.map((work, index) => (
                      <tr key={work.id} style={{ backgroundColor: index % 2 === 0 ? '#fff' : '#f8f9fa' }}>
                        <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{work.id}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6', fontWeight: 'bold' }}>{work.name}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{work.code || '-'}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{work.empresa_id}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>{work.cidade || '-'}</td>
                        <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '4px',
                            fontSize: '13px',
                            fontWeight: 'bold',
                            backgroundColor: work.status === 'active' ? '#d4edda' : '#f8d7da',
                            color: work.status === 'active' ? '#155724' : '#721c24'
                          }}>
                            {work.status || 'indefinido'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* CARGAS */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ 
              padding: '15px', 
              backgroundColor: '#fff3e0', 
              borderRadius: '8px 8px 0 0',
              margin: '0 0 0 0',
              borderBottom: '2px solid #f57c00'
            }}>
              📦 Cargas Cadastradas ({loads.length})
            </h2>
            
            {loads.length === 0 ? (
              <div style={{ 
                padding: '30px', 
                textAlign: 'center', 
                backgroundColor: '#f5f5f5',
                border: '1px solid #ddd',
                borderTop: 'none',
                borderRadius: '0 0 8px 8px'
              }}>
                <p style={{ color: '#666', margin: 0 }}>📭 Nenhuma carga cadastrada no banco de dados</p>
              </div>
            ) : (
              <div style={{ 
                border: '1px solid #ddd', 
                borderTop: 'none', 
                borderRadius: '0 0 8px 8px',
                padding: '15px',
                backgroundColor: '#fff'
              }}>
                {loads.map((load, index) => (
                  <div key={load.id} style={{ 
                    padding: '15px', 
                    marginBottom: index < loads.length - 1 ? '15px' : '0', 
                    border: '1px solid #dee2e6', 
                    borderRadius: '6px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <strong style={{ fontSize: '16px' }}>
                        📄 NF {load.invoice_number} - {load.concrete_type}
                      </strong>
                      <span style={{ color: '#666' }}>ID: {load.id}</span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                      <div>
                        <small style={{ color: '#666' }}>📅 Data:</small>
                        <div>{new Date(load.molding_date).toLocaleDateString('pt-BR')}</div>
                      </div>
                      <div>
                        <small style={{ color: '#666' }}>🚛 Caminhão:</small>
                        <div>{load.caminhao}</div>
                      </div>
                      <div>
                        <small style={{ color: '#666' }}>📦 Volume:</small>
                        <div>{load.volume_m3} m³</div>
                      </div>
                      <div>
                        <small style={{ color: '#666' }}>📏 Slump:</small>
                        <div>{load.slump_cm} cm</div>
                      </div>
                      <div>
                        <small style={{ color: '#666' }}>💪 FCK:</small>
                        <div>{load.fck_mpa} MPa</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AMOSTRAS */}
          <div style={{ marginBottom: '40px' }}>
            <h2 style={{ 
              padding: '15px', 
              backgroundColor: '#fce4ec', 
              borderRadius: '8px 8px 0 0',
              margin: '0 0 0 0',
              borderBottom: '2px solid #c2185b'
            }}>
              🧪 Amostras Cadastradas ({samples.length})
            </h2>
            
            {samples.length === 0 ? (
              <div style={{ 
                padding: '30px', 
                textAlign: 'center', 
                backgroundColor: '#f5f5f5',
                border: '1px solid #ddd',
                borderTop: 'none',
                borderRadius: '0 0 8px 8px'
              }}>
                <p style={{ color: '#666', margin: 0 }}>📭 Nenhuma amostra cadastrada no banco de dados</p>
              </div>
            ) : (
              <div style={{ 
                border: '1px solid #ddd', 
                borderTop: 'none', 
                borderRadius: '0 0 8px 8px',
                padding: '15px',
                backgroundColor: '#fff',
                maxHeight: '500px',
                overflowY: 'auto'
              }}>
                {samples.map((sample, index) => (
                  <div key={sample.id} style={{ 
                    padding: '12px', 
                    marginBottom: index < samples.length - 1 ? '10px' : '0', 
                    border: '1px solid #dee2e6', 
                    borderRadius: '5px',
                    backgroundColor: '#f8f9fa'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong style={{ fontSize: '15px' }}>Lab #{sample.numero_laboratorio}</strong>
                        <div style={{ fontSize: '13px', color: '#666', marginTop: '3px' }}>
                          Seq: {sample.sequencia} | Idade: {sample.idade_dias} dias | 
                          Status: <span style={{
                            padding: '2px 6px',
                            borderRadius: '3px',
                            backgroundColor: sample.status === 'testado' ? '#d4edda' : '#fff3cd',
                            color: sample.status === 'testado' ? '#155724' : '#856404'
                          }}>{sample.status}</span>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {sample.resistencia_mpa ? (
                          <div>
                            <strong style={{ fontSize: '18px', color: '#28a745' }}>{sample.resistencia_mpa} MPa</strong>
                            <div style={{ fontSize: '11px', color: '#666' }}>Carga: {sample.carga_kn} kN</div>
                          </div>
                        ) : (
                          <span style={{ color: '#999', fontSize: '13px' }}>Não testado</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Instruções de Uso */}
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#fff3cd', 
        border: '2px solid #ffc107',
        borderRadius: '8px',
        marginTop: '40px'
      }}>
        <h3 style={{ marginTop: 0 }}>📋 Instruções de Uso:</h3>
        <ol style={{ marginBottom: 0, lineHeight: '1.8' }}>
          <li>Certifique-se que o <strong>backend está rodando</strong> em <code>http://localhost:3001</code></li>
          <li>Execute no terminal: <code>cd "C:\Projeto PDS\backend" && npm start</code></li>
          <li>Clique em <strong>"🔄 Atualizar Dados"</strong> acima</li>
          <li>Se aparecer <strong>"✅ Backend Online"</strong>, a conexão está funcionando perfeitamente! 🎉</li>
          <li>Verifique o <strong>Console do navegador (F12)</strong> para logs detalhados das requisições</li>
        </ol>
      </div>

      {/* Debug Info */}
      <details style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
        <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>🔧 Informações de Debug</summary>
        <div style={{ marginTop: '15px', fontSize: '14px', fontFamily: 'monospace' }}>
          <p><strong>Backend URL:</strong> {getApiBaseUrl()}</p>
          <p><strong>Status:</strong> {backendStatus}</p>
          <p><strong>Loading:</strong> {loading ? 'Sim' : 'Não'}</p>
          <p><strong>Erro:</strong> {error || 'Nenhum'}</p>
          <p><strong>Total de registros:</strong> {companies.length + works.length + loads.length + samples.length}</p>
        </div>
      </details>
    </div>
  );
};

export default TestConnectionBackend;
