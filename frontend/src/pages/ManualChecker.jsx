import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Search, Loader, ExternalLink } from 'lucide-react';

const ManualChecker = () => {
  const [domains, setDomains] = useState('');
  const [checking, setChecking] = useState(false);
  const [results, setResults] = useState(null);

  const handleCheck = async () => {
    // Parse domains from textarea (one per line)
    const domainList = domains
      .split('\n')
      .map(d => d.trim())
      .filter(d => d.length > 0);

    if (domainList.length === 0) {
      toast.error('Please enter at least one domain');
      return;
    }

    if (domainList.length > 5) {
      toast.error('Maximum 5 domains allowed');
      return;
    }

    setChecking(true);
    setResults(null);

    try {
      const response = await axios.post('http://192.168.10.140:5000/api/bulk-check', {
        apiKey: 'abcdef123',
        urls: domainList,
        mode: 'official'
      });

      if (response.data.success) {
        setResults(response.data);
        toast.success(`Checked ${response.data.totalChecked} domain(s)`);
      } else {
        toast.error('Failed to check domains');
      }
    } catch (error) {
      console.error('Check error:', error);
      toast.error(error.response?.data?.message || 'Failed to check domains');
    } finally {
      setChecking(false);
    }
  };

  const getStatusBadge = (result) => {
    if (result.blocked) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-red-100 text-red-800">
          <XCircle className="w-4 h-4 mr-1" />
          Ada (Blocked)
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800">
          <CheckCircle className="w-4 h-4 mr-1" />
          Tidak Ada (Accessible)
        </span>
      );
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Manual Domain Checker
        </h1>
        <p className="text-gray-600">
          Check up to 5 domains manually for Nawala blocking status
        </p>
      </div>

      {/* Input Card */}
      <div className="card p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Enter Domains (one per line, max 5)
        </label>
        <textarea
          value={domains}
          onChange={(e) => setDomains(e.target.value)}
          placeholder="example.com&#10;google.com&#10;facebook.com"
          rows="5"
          className="input w-full mb-4 font-mono text-sm"
          disabled={checking}
        />
        
        <button
          onClick={handleCheck}
          disabled={checking}
          className="btn btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {checking ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Checking...</span>
            </>
          ) : (
            <>
              <Search className="w-5 h-5" />
              <span>Check Domains</span>
            </>
          )}
        </button>
      </div>

      {/* Results Card */}
      {results && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Check Results
            </h2>
            <div className="text-sm text-gray-600">
              Total Duration: <span className="font-semibold">{results.totalDuration}ms</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Domain</th>
                  <th>Status</th>
                  <th>Response Time</th>
                  <th>Confidence</th>
                  <th>Checked At</th>
                </tr>
              </thead>
              <tbody>
                {results.results.map((result, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="text-sm">{index + 1}</td>
                    <td className="font-mono font-medium">
                      <div className="flex items-center space-x-2">
                        <span>{result.domain}</span>
                        <a
                          href={`https://${result.domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Open domain in new tab"
                        >
                          <ExternalLink size={16} />
                        </a>
                      </div>
                    </td>
                    <td>{getStatusBadge(result)}</td>
                    <td className="text-sm text-gray-600">{result.responseTime}ms</td>
                    <td>
                      <span className="badge badge-info capitalize">
                        {result.confidence}
                      </span>
                    </td>
                    <td className="text-sm text-gray-600">
                      {new Date(result.checkedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Total Checked:</span>
                <span className="ml-2 font-semibold text-gray-900">{results.totalChecked}</span>
              </div>
              <div>
                <span className="text-gray-600">Blocked:</span>
                <span className="ml-2 font-semibold text-red-600">
                  {results.results.filter(r => r.blocked).length}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Accessible:</span>
                <span className="ml-2 font-semibold text-green-600">
                  {results.results.filter(r => !r.blocked).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualChecker;
